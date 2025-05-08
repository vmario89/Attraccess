import { ResetNTAG424State } from './reset-ntag424.state';
import { InitialReaderState } from './initial.state';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderEventType } from '../websocket.types';
import { GatewayServices } from '../websocket.gateway';

// Mock InitialReaderState
jest.mock('./initial.state', () => ({
  InitialReaderState: jest.fn().mockImplementation(() => ({
    getInitMessage: jest.fn().mockReturnValue(new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {})),
  })),
}));

describe('ResetNTAG424State', () => {
  let resetState: ResetNTAG424State;
  let mockSocket: AuthenticatedWebSocket;
  let mockServices: GatewayServices;
  const mockCardId = 123;
  const mockCardUID = 'card-uid-123';
  const mockMasterKey = 'aaaabbbbccccddddeeeeffffgggghhhh';
  const mockDefaultMasterKey = '00000000000000000000000000000000';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSocket = {
      send: jest.fn(),
      state: undefined,
    } as unknown as AuthenticatedWebSocket;

    mockServices = {
      dbService: {
        getNFCCardByID: jest.fn(),
        getNFCCardByUID: jest.fn(),
        deleteNFCCard: jest.fn(),
      },
      fabreaderService: {
        uint8ArrayToHexString: jest.fn().mockReturnValue(mockDefaultMasterKey),
      },
    } as unknown as GatewayServices;

    // Default mock for getting card by ID
    (mockServices.dbService.getNFCCardByID as jest.Mock).mockResolvedValue({
      id: mockCardId,
      uid: mockCardUID,
      keys: { 0: mockMasterKey },
    });

    resetState = new ResetNTAG424State(mockSocket, mockServices, mockCardId);
  });

  describe('getInitMessage', () => {
    it('should fetch the card and return the correct init message', async () => {
      const initMessage = await resetState.getInitMessage();

      expect(mockServices.dbService.getNFCCardByID).toHaveBeenCalledWith(mockCardId);
      expect(initMessage).toEqual(
        new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
          displayText: 'Tap your NFC card to reset it',
        })
      );
    });

    it('should throw an error if the card is not found', async () => {
      (mockServices.dbService.getNFCCardByID as jest.Mock).mockResolvedValue(null);

      await expect(resetState.getInitMessage()).rejects.toThrow(`Card not found: ${mockCardId}`);
    });
  });

  describe('onEvent', () => {
    it('should handle NFC_TAP event with the correct card', async () => {
      // Setup
      await resetState.getInitMessage(); // Initialize card

      // Mock getNFCCardByUID to return the same card
      (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue({
        id: mockCardId,
        uid: mockCardUID,
        keys: { 0: mockMasterKey },
      });

      // Test
      const result = await resetState.onEvent({
        type: FabreaderEventType.NFC_TAP,
        payload: { cardUID: mockCardUID },
      });

      // Assert
      expect(mockSocket.send).toHaveBeenCalled();
      expect(mockServices.dbService.getNFCCardByUID).toHaveBeenCalledWith(mockCardUID);
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.CHANGE_KEYS);
      // The authentication key should be the master key from the card
      expect(result.data.payload.authenticationKey).toBe(mockMasterKey);
      expect(result.data.payload.keys[0]).toBe(mockDefaultMasterKey);
    });

    it('should use default key if card record is not found', async () => {
      // Setup
      await resetState.getInitMessage(); // Initialize card

      // Mock getNFCCardByUID to return null
      (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

      // Test
      const result = await resetState.onEvent({
        type: FabreaderEventType.NFC_TAP,
        payload: { cardUID: mockCardUID },
      });

      // Assert
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.CHANGE_KEYS);
      // The authentication key should be the default master key
      expect(result.data.payload.authenticationKey).toBe(mockDefaultMasterKey);
      expect(result.data.payload.keys[0]).toBe(mockDefaultMasterKey);
    });

    it('should ignore NFC_TAP event with incorrect card UID', async () => {
      // Setup
      await resetState.getInitMessage(); // Initialize card

      // Test
      const result = await resetState.onEvent({
        type: FabreaderEventType.NFC_TAP,
        payload: { cardUID: 'wrong-card-uid' },
      });

      // Assert
      expect(result).toBeUndefined();
    });

    it('should ignore unexpected events', async () => {
      const result = await resetState.onEvent({
        type: FabreaderEventType.NFC_REMOVED,
        payload: {},
      });

      expect(result).toBeUndefined();
    });
  });

  describe('onResponse', () => {
    it('should handle successful key change', async () => {
      // Setup
      await resetState.getInitMessage(); // Initialize card

      // Test
      const result = await resetState.onResponse({
        type: FabreaderEventType.CHANGE_KEYS,
        payload: {
          successfulKeys: [0],
          failedKeys: [],
        },
      });

      // Assert
      expect(mockServices.dbService.deleteNFCCard).toHaveBeenCalledWith(mockCardId);
      expect(mockSocket.send).toHaveBeenCalled();

      // Verify success message sent to socket
      const sendArg = (mockSocket.send as jest.Mock).mock.calls[0][0];
      const sentEvent = JSON.parse(sendArg);
      expect(sentEvent.data.type).toBe(FabreaderEventType.DISPLAY_SUCCESS);
      expect(sentEvent.data.payload.message).toBe('Reset successful');

      // Verify state transition
      expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    });

    it('should handle failed key change', async () => {
      // Test
      const result = await resetState.onResponse({
        type: FabreaderEventType.CHANGE_KEYS,
        payload: {
          successfulKeys: [],
          failedKeys: [0],
        },
      });

      // Assert
      expect(mockServices.dbService.deleteNFCCard).not.toHaveBeenCalled();
      expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    });

    it('should ignore unexpected response types', async () => {
      const result = await resetState.onResponse({
        type: FabreaderEventType.AUTHENTICATE,
        payload: {},
      });

      expect(result).toBeUndefined();
    });
  });
});

/**
 * Tests the full flow of card reset
 */
describe('ResetNTAG424State - Full Flow', () => {
  let resetState: ResetNTAG424State;
  let mockSocket: AuthenticatedWebSocket;
  let mockServices: GatewayServices;
  const mockCardId = 123;
  const mockCardUID = 'card-uid-123';
  const mockMasterKey = 'aaaabbbbccccddddeeeeffffgggghhhh';
  const mockDefaultMasterKey = '00000000000000000000000000000000';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSocket = {
      send: jest.fn(),
      state: undefined,
    } as unknown as AuthenticatedWebSocket;

    mockServices = {
      dbService: {
        getNFCCardByID: jest.fn().mockResolvedValue({
          id: mockCardId,
          uid: mockCardUID,
          keys: { 0: mockMasterKey },
        }),
        getNFCCardByUID: jest.fn().mockResolvedValue({
          id: mockCardId,
          uid: mockCardUID,
          keys: { 0: mockMasterKey },
        }),
        deleteNFCCard: jest.fn().mockResolvedValue(undefined),
      },
      fabreaderService: {
        uint8ArrayToHexString: jest.fn().mockReturnValue(mockDefaultMasterKey),
      },
    } as unknown as GatewayServices;

    resetState = new ResetNTAG424State(mockSocket, mockServices, mockCardId);
  });

  it('should complete successful reset flow', async () => {
    // Step 1: Initialize reset state
    const initMessage = await resetState.getInitMessage();

    expect(initMessage.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    expect(mockServices.dbService.getNFCCardByID).toHaveBeenCalledWith(mockCardId);

    // Step 2: User taps the NFC card
    const nfcTapResponse = await resetState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    expect(nfcTapResponse.data.type).toBe(FabreaderEventType.CHANGE_KEYS);
    expect(nfcTapResponse.data.payload.authenticationKey).toBe(mockMasterKey);
    expect(nfcTapResponse.data.payload.keys[0]).toBe(mockDefaultMasterKey);

    // Step 3: Keys changed successfully
    const changeKeysResponse = await resetState.onResponse({
      type: FabreaderEventType.CHANGE_KEYS,
      payload: {
        successfulKeys: [0],
        failedKeys: [],
      },
    });

    // Step 4: Card deleted and transition to initial state
    expect(mockServices.dbService.deleteNFCCard).toHaveBeenCalledWith(mockCardId);
    expect(mockSocket.send).toHaveBeenCalled();

    // Verify success message
    const successMessageJSON = (mockSocket.send as jest.Mock).mock.calls.find(
      (call) => JSON.parse(call[0]).data.type === FabreaderEventType.DISPLAY_SUCCESS
    )[0];
    const successMessage = JSON.parse(successMessageJSON);
    expect(successMessage.data.payload.message).toBe('Reset successful');

    expect(changeKeysResponse.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
  });

  it('should handle wrong card tap', async () => {
    // Initialize reset state
    await resetState.getInitMessage();

    // User taps the wrong NFC card
    const nfcTapResponse = await resetState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: 'wrong-card-uid' },
    });

    // Wrong card should be ignored
    expect(nfcTapResponse).toBeUndefined();
    expect(mockServices.dbService.deleteNFCCard).not.toHaveBeenCalled();
  });

  it('should handle key change failure', async () => {
    // Initialize reset state
    await resetState.getInitMessage();

    // User taps the correct NFC card
    await resetState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Keys failed to change
    const changeKeysResponse = await resetState.onResponse({
      type: FabreaderEventType.CHANGE_KEYS,
      payload: {
        successfulKeys: [],
        failedKeys: [0],
      },
    });

    // Card should not be deleted
    expect(mockServices.dbService.deleteNFCCard).not.toHaveBeenCalled();

    // Should transition to initial state
    expect(changeKeysResponse.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
  });
});

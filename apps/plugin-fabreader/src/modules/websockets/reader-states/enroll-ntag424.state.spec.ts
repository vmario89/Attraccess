import { EnrollmentState, EnrollNTAG424State } from './enroll-ntag424.state';
import { InitialReaderState } from './initial.state';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderEventType } from '../websocket.types';
import { GatewayServices } from '../websocket.gateway';

// Mock crypto.subtle
const mockDigest = jest.fn();
jest.mock('crypto', () => ({
  subtle: {
    digest: (...args) => mockDigest(...args),
  },
}));

// Mock InitialReaderState
jest.mock('./initial.state', () => ({
  InitialReaderState: jest.fn().mockImplementation(() => ({
    getInitMessage: jest.fn().mockReturnValue(new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {})),
  })),
}));

describe('EnrollNTAG424State', () => {
  let enrollState: EnrollNTAG424State;
  let mockSocket: AuthenticatedWebSocket & { enrollment?: EnrollmentState };
  let mockServices: GatewayServices;
  const mockUserId = 1;
  const mockCardUID = 'card-uid-123';
  const mockNewMasterKey = 'aaaabbbbccccddddeeeeffffgggghhhh';

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    mockSocket = {
      enrollment: undefined,
      send: jest.fn(),
    } as unknown as AuthenticatedWebSocket & { enrollment?: EnrollmentState };

    mockServices = {
      dbService: {
        getNFCCardByUID: jest.fn(),
        createNFCCard: jest.fn(),
      },
    } as unknown as GatewayServices;

    // Setup subtle.digest mock to return a consistent value for testing
    mockDigest.mockImplementation(() => {
      return Promise.resolve(
        new Uint8Array(
          Array(32)
            .fill(0)
            .map((_, i) => (i % 16) + 0xa0)
        )
      );
    });

    enrollState = new EnrollNTAG424State(mockSocket, mockServices, mockUserId);
  });

  describe('getInitMessage', () => {
    it('should initialize enrollment state and return the correct init message', () => {
      const initMessage = enrollState.getInitMessage();

      expect(mockSocket.enrollment).toEqual({
        nextExpectedEvent: FabreaderEventType.NFC_TAP,
        data: {},
      });

      expect(initMessage).toEqual(
        new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
          displayText: 'Tap your NFC card to enroll',
        })
      );
    });
  });

  describe('onEvent', () => {
    it('should handle NFC_REMOVED event', async () => {
      await enrollState.onEvent({
        type: FabreaderEventType.NFC_REMOVED,
        payload: {},
      });

      expect(mockSocket.enrollment).toBeUndefined();
      expect(mockSocket.send).toHaveBeenCalled();
      expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
    });

    it('should handle NFC_TAP event when expected', async () => {
      // Setup
      mockSocket.enrollment = {
        nextExpectedEvent: FabreaderEventType.NFC_TAP,
        data: {},
      };

      (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

      // Call method
      const result = await enrollState.onEvent({
        type: FabreaderEventType.NFC_TAP,
        payload: { cardUID: mockCardUID },
      });

      // Assert
      expect(mockSocket.enrollment.cardUID).toBe(mockCardUID);
      expect(mockSocket.enrollment.nextExpectedEvent).toBe(FabreaderEventType.CHANGE_KEYS);
      expect(mockSocket.enrollment.data.newKeys).toBeDefined();
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.CHANGE_KEYS);
    });

    it('should ignore unexpected events', async () => {
      const result = await enrollState.onEvent({
        type: FabreaderEventType.DISPLAY_ERROR,
        payload: {},
      });

      expect(result).toBeUndefined();
    });
  });

  describe('onResponse', () => {
    it('should ignore responses with unexpected type', async () => {
      mockSocket.enrollment = {
        nextExpectedEvent: FabreaderEventType.AUTHENTICATE,
        data: {},
      };

      const result = await enrollState.onResponse({
        type: FabreaderEventType.CHANGE_KEYS,
        payload: {},
      });

      expect(result).toBeUndefined();
    });

    it('should handle successful key change', async () => {
      // Setup
      mockSocket.enrollment = {
        nextExpectedEvent: FabreaderEventType.CHANGE_KEYS,
        data: {
          newKeys: { 0: mockNewMasterKey },
        },
      };

      // Call method
      const result = await enrollState.onResponse({
        type: FabreaderEventType.CHANGE_KEYS,
        payload: {
          successfulKeys: [0],
          failedKeys: [],
        },
      });

      // Assert
      expect(mockSocket.enrollment.nextExpectedEvent).toBe(FabreaderEventType.AUTHENTICATE);
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.AUTHENTICATE);
    });

    it('should handle failed key change', async () => {
      // Setup
      mockSocket.enrollment = {
        nextExpectedEvent: FabreaderEventType.CHANGE_KEYS,
        data: {
          newKeys: { 0: mockNewMasterKey },
        },
      };

      // Call method
      await enrollState.onResponse({
        type: FabreaderEventType.CHANGE_KEYS,
        payload: {
          successfulKeys: [],
          failedKeys: [0],
        },
      });

      // Assert
      expect(mockSocket.enrollment).toBeUndefined();
      expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
    });

    it('should handle successful authentication', async () => {
      // Setup
      mockSocket.enrollment = {
        nextExpectedEvent: FabreaderEventType.AUTHENTICATE,
        data: {
          newKeys: { 0: mockNewMasterKey },
        },
      };

      // Call method
      const result = await enrollState.onResponse({
        type: FabreaderEventType.AUTHENTICATE,
        payload: {
          successfulKeys: [0],
          failedKeys: [],
        },
      });

      // Assert
      expect(mockSocket.enrollment).toBeUndefined();
      expect(result).toBeInstanceOf(FabreaderEvent);
      expect(result.data.type).toBe(FabreaderEventType.DISPLAY_SUCCESS);
    });

    it('should handle failed authentication', async () => {
      // Setup
      mockSocket.enrollment = {
        nextExpectedEvent: FabreaderEventType.AUTHENTICATE,
        cardUID: mockCardUID,
        data: {
          newKeys: { 0: mockNewMasterKey },
        },
      };

      (mockServices.dbService.createNFCCard as jest.Mock).mockResolvedValue({ id: 'nfc-card-1' });

      // Call method
      await enrollState.onResponse({
        type: FabreaderEventType.AUTHENTICATE,
        payload: {
          successfulKeys: [],
          failedKeys: [0],
        },
      });

      // Assert
      expect(mockSocket.enrollment).toBeUndefined();
      expect(mockServices.dbService.createNFCCard).toHaveBeenCalledWith({
        uid: mockCardUID,
        userId: mockUserId,
        keys: {
          0: mockNewMasterKey,
        },
      });
      expect(mockSocket.send).toHaveBeenCalled();
      expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
    });
  });
});

/**
 * Tests that the socket is guided correctly through the enrollment process
 */
describe('EnrollNTAG424State - Full Flow', () => {
  let enrollState: EnrollNTAG424State;
  let mockSocket: AuthenticatedWebSocket & { enrollment?: EnrollmentState };
  let mockServices: GatewayServices;
  const mockUserId = 1;
  const mockCardUID = 'card-uid-123';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSocket = {
      enrollment: undefined,
      send: jest.fn(),
    } as unknown as AuthenticatedWebSocket & { enrollment?: EnrollmentState };

    mockServices = {
      dbService: {
        getNFCCardByUID: jest.fn(),
        createNFCCard: jest.fn(),
      },
    } as unknown as GatewayServices;

    mockDigest.mockImplementation(() => {
      return Promise.resolve(
        new Uint8Array(
          Array(32)
            .fill(0)
            .map((_, i) => (i % 16) + 0xa0)
        )
      );
    });

    enrollState = new EnrollNTAG424State(mockSocket, mockServices, mockUserId);
  });

  it('should complete successful enrollment flow', async () => {
    // Step 1: Initialize enrollment state
    const initMessage = enrollState.getInitMessage();

    expect(initMessage.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    expect(mockSocket.enrollment.nextExpectedEvent).toBe(FabreaderEventType.NFC_TAP);

    // Step 2: User taps NFC card
    (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

    const nfcTapResponse = await enrollState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    expect(nfcTapResponse.data.type).toBe(FabreaderEventType.CHANGE_KEYS);
    expect(mockSocket.enrollment.cardUID).toBe(mockCardUID);
    expect(mockSocket.enrollment.nextExpectedEvent).toBe(FabreaderEventType.CHANGE_KEYS);
    expect(mockSocket.enrollment.data.newKeys).toBeDefined();

    // Step 3: Keys changed successfully
    const changeKeysResponse = await enrollState.onResponse({
      type: FabreaderEventType.CHANGE_KEYS,
      payload: {
        successfulKeys: [0],
        failedKeys: [],
      },
    });

    expect(changeKeysResponse.data.type).toBe(FabreaderEventType.AUTHENTICATE);
    expect(mockSocket.enrollment.nextExpectedEvent).toBe(FabreaderEventType.AUTHENTICATE);

    // Step 4: Authentication successful
    const authResponse = await enrollState.onResponse({
      type: FabreaderEventType.AUTHENTICATE,
      payload: {
        successfulKeys: [0],
        failedKeys: [],
      },
    });

    // Step 5: Enrollment successfully completed
    expect(authResponse.data.type).toBe(FabreaderEventType.DISPLAY_SUCCESS);
    expect(authResponse.data.payload).toEqual({
      message: 'Enrollment successful',
    });
    expect(mockSocket.enrollment).toBeUndefined(); // Enrollment state cleared
  });

  it('should handle card removal during enrollment', async () => {
    // Initialize enrollment
    enrollState.getInitMessage();

    // Simulate card removal
    const nfcRemovedResponse = await enrollState.onEvent({
      type: FabreaderEventType.NFC_REMOVED,
      payload: {},
    });

    // Verify error message was sent
    expect(mockSocket.send).toHaveBeenCalled();
    const sendArg = (mockSocket.send as jest.Mock).mock.calls[0][0];
    expect(JSON.parse(sendArg).data.type).toBe(FabreaderEventType.DISPLAY_ERROR);

    // Verify transition back to initial state
    expect(mockSocket.enrollment).toBeUndefined();
    expect(nfcRemovedResponse.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
  });

  it('should handle key change failure', async () => {
    // Initialize and tap card
    enrollState.getInitMessage();
    (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

    await enrollState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Simulate key change failure
    const changeKeysErrorResponse = await enrollState.onResponse({
      type: FabreaderEventType.CHANGE_KEYS,
      payload: {
        successfulKeys: [],
        failedKeys: [0],
      },
    });

    // Verify transition back to initial state
    expect(mockSocket.enrollment).toBeUndefined();
    expect(changeKeysErrorResponse.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
    expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
  });

  it('should handle authentication failure and store card data', async () => {
    // Setup mock for card creation
    (mockServices.dbService.createNFCCard as jest.Mock).mockResolvedValue({ id: 'nfc-card-1' });

    // Initialize and tap card
    enrollState.getInitMessage();
    (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

    await enrollState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Successfully change keys
    await enrollState.onResponse({
      type: FabreaderEventType.CHANGE_KEYS,
      payload: {
        successfulKeys: [0],
        failedKeys: [],
      },
    });

    // Simulate authentication failure
    const authFailResponse = await enrollState.onResponse({
      type: FabreaderEventType.AUTHENTICATE,
      payload: {
        successfulKeys: [],
        failedKeys: [0],
      },
    });

    // Verify card was created despite authentication failure
    expect(mockServices.dbService.createNFCCard).toHaveBeenCalledWith({
      uid: mockCardUID,
      userId: mockUserId,
      keys: expect.any(Object),
    });

    // Verify error message and transition back to initial state
    expect(mockSocket.send).toHaveBeenCalled();
    expect(mockSocket.enrollment).toBeUndefined();
    expect(authFailResponse.data.type).toBe(FabreaderEventType.ENABLE_CARD_CHECKING);
  });

  it('should handle existing card tap', async () => {
    // Setup mock for existing card
    const existingCard = {
      id: 'existing-card-1',
      uid: mockCardUID,
      keys: { 0: 'existingMasterKey' },
    };
    (mockServices.dbService.getNFCCardByUID as jest.Mock).mockResolvedValue(existingCard);

    // Initialize and tap card
    enrollState.getInitMessage();

    const nfcTapResponse = await enrollState.onEvent({
      type: FabreaderEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Verify it attempts to change keys using the existing master key
    expect(nfcTapResponse.data.type).toBe(FabreaderEventType.CHANGE_KEYS);
    expect(nfcTapResponse.data.payload.authenticationKey).toBe('existingMasterKey');
  });

  it('should ignore unexpected events', async () => {
    // Initialize enrollment
    enrollState.getInitMessage();

    // Send unexpected event
    const response = await enrollState.onEvent({
      type: FabreaderEventType.DISPLAY_ERROR,
      payload: {},
    });

    // Verify nothing happens
    expect(response).toBeUndefined();
    expect(mockSocket.enrollment.nextExpectedEvent).toBe(FabreaderEventType.NFC_TAP);
  });
});

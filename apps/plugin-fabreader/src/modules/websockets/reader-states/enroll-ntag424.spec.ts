import { EnrollmentState, EnrollNTAG424State } from './enroll-ntag424.state';
import { InitialReaderState } from './initial.state';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderEventType } from '../websocket.types';
import { DbService } from '../../persistence/db.service';
import { WebsocketService } from '../websocket.service';

// Mock the InitialReaderState class
jest.mock('./initial.state', () => {
  return {
    InitialReaderState: jest.fn().mockImplementation(() => ({
      getInitMessage: jest.fn().mockResolvedValue(
        new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
          message: 'Initial state message',
        })
      ),
    })),
  };
});

describe('EnrollNTAG424State', () => {
  let state: EnrollNTAG424State;
  let mockSocket: jest.Mocked<AuthenticatedWebSocket & { enrollment: EnrollmentState }>;
  let mockWebSocketService: jest.Mocked<WebsocketService>;
  let mockDbService: jest.Mocked<DbService>;

  const userId = 1;

  beforeEach(() => {
    mockSocket = {
      send: jest.fn(),
      enrollment: undefined,
    } as unknown as jest.Mocked<AuthenticatedWebSocket & { enrollment: EnrollmentState }>;

    mockDbService = {
      getNFCCardByUID: jest.fn(),
      createNFCCard: jest.fn(),
    } as unknown as jest.Mocked<DbService>;

    state = new EnrollNTAG424State(
      mockSocket,
      {
        dbService: mockDbService,
        websocketService: mockWebSocketService,
      },
      userId
    );
  });

  describe('Initialization', () => {
    it('should initialize with correct key constants', () => {
      expect(state.KEY_ZERO_MASTER).toBe(0);
      expect(state.KEY_ONE_APP_AUTH).toBe(1);
      expect(state.KEY_TWO_APP_READ).toBe(2);
      expect(state.KEY_THREE_APP_WRITE).toBe(3);
      expect(state.KEY_FOUR_APP_READ_WRITE).toBe(4);
    });

    it('should initialize with default keys', () => {
      Object.values(state.DEFAULT_NTAG424_KEYS).forEach((key) => {
        expect(key).toHaveLength(16);
        expect(key.every((byte) => byte === 0)).toBeTruthy();
      });
    });
  });

  describe('getInitMessage', () => {
    it('should set initial enrollment state', async () => {
      const initMessage = await state.getInitMessage();
      expect(initMessage.data.type).toBe(FabreaderEventType.GET_NFC_UID);
      expect(mockSocket.enrollment).toEqual({
        lastSendEvent: FabreaderEventType.GET_NFC_UID,
        data: {},
      });
    });

    it('should return the correct message', async () => {
      const initMessage = await state.getInitMessage();
      expect(initMessage.data.type).toBe(FabreaderEventType.GET_NFC_UID);
    });
  });

  describe('onEvent', () => {
    it('should handle NFC_REMOVED event', async () => {
      mockSocket.enrollment = {
        lastSendEvent: FabreaderEventType.GET_NFC_UID,
        data: {},
      };

      const payloadsSentToSocket: string[] = [];
      mockSocket.send.mockImplementation((data) => {
        payloadsSentToSocket.push(data as string);
      });

      const result = await state.onEvent({
        type: FabreaderEventType.NFC_REMOVED,
        payload: undefined,
      });

      expect(mockSocket.enrollment).toBeUndefined();
      const displayCardRemovedTextEvent = new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
        message: 'NFC Card removed',
      });
      const expectedEvent = {
        ...displayCardRemovedTextEvent,
        data: {
          ...displayCardRemovedTextEvent.data,
        },
      };

      expect(payloadsSentToSocket).toHaveLength(1);
      const parsedSentPayload = JSON.parse(payloadsSentToSocket[0]);
      expect(parsedSentPayload).toEqual(expectedEvent);
      expect(result).toBeDefined();
    });

    it('should return undefined for unknown event types', async () => {
      const result = await state.onEvent({
        type: 'UNKNOWN_EVENT' as FabreaderEventType,
        payload: undefined,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('onResponse', () => {
    beforeEach(() => {
      mockSocket.enrollment = {
        lastSendEvent: FabreaderEventType.GET_NFC_UID,
        data: {},
      };
    });

    it('should return undefined for unexpected response types', async () => {
      const result = await state.onResponse({
        type: FabreaderEventType.CHANGE_KEYS,
        payload: undefined,
      });
      expect(result).toBeUndefined();
    });

    describe('GET_NFC_UID response', () => {
      it('should handle successful GET_NFC_UID response', async () => {
        mockSocket.enrollment.lastSendEvent = FabreaderEventType.GET_NFC_UID;
        mockDbService.getNFCCardByUID.mockResolvedValue(null);

        const result = await state.onResponse({
          type: FabreaderEventType.GET_NFC_UID,
          payload: { cardUID: 'test-card-uid' },
        });

        expect(mockSocket.enrollment.cardUID).toBe('test-card-uid');
        expect(mockSocket.enrollment.lastSendEvent).toBe(FabreaderEventType.CHANGE_KEYS);
        expect(mockSocket.enrollment.data.newKeys).toBeDefined();
        expect(result).toBeDefined();
      });
    });

    describe('CHANGE_KEYS response', () => {
      it('should handle successful key change', async () => {
        mockSocket.enrollment.lastSendEvent = FabreaderEventType.CHANGE_KEYS;
        mockSocket.enrollment.data.newKeys = {
          0: new Uint8Array(16).fill(1),
          1: new Uint8Array(16).fill(2),
          2: new Uint8Array(16).fill(3),
          3: new Uint8Array(16).fill(4),
          4: new Uint8Array(16).fill(5),
        };

        const result = await state.onResponse({
          type: FabreaderEventType.CHANGE_KEYS,
          payload: { success: true },
        });

        expect(mockSocket.enrollment.lastSendEvent).toBe(FabreaderEventType.WRITE_FILES);
        expect(mockSocket.enrollment.data.verificationToken).toBeDefined();
        expect(mockSocket.enrollment.data.antiDuplicationToken).toBeDefined();
        expect(result).toBeDefined();
      });

      it('should handle failed key change', async () => {
        mockSocket.enrollment.lastSendEvent = FabreaderEventType.CHANGE_KEYS;

        const result = await state.onResponse({
          type: FabreaderEventType.CHANGE_KEYS,
          payload: { success: false, error: 'Key change failed' },
        });

        expect(mockSocket.enrollment).toBeUndefined();
        expect(result).toBeDefined();
        // Verify the mock InitialReaderState was used
        expect(InitialReaderState).toHaveBeenCalled();
      });
    });

    describe('WRITE_FILES response', () => {
      it('should handle successful file write', async () => {
        mockSocket.enrollment.lastSendEvent = FabreaderEventType.WRITE_FILES;
        mockSocket.enrollment.cardUID = 'test-card-uid';
        mockSocket.enrollment.data = {
          newKeys: {
            0: new Uint8Array(16).fill(1),
            1: new Uint8Array(16).fill(2),
            2: new Uint8Array(16).fill(3),
            3: new Uint8Array(16).fill(4),
            4: new Uint8Array(16).fill(5),
          },
          verificationToken: new Uint8Array(16).fill(6),
          antiDuplicationToken: new Uint8Array(16).fill(7),
        };

        const result = await state.onResponse({
          type: FabreaderEventType.WRITE_FILES,
          payload: { success: true },
        });

        expect(mockDbService.createNFCCard).toHaveBeenCalled();
        expect(mockSocket.enrollment).toBeUndefined();
        expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('NFC Card enrolled successfully'));
        expect(result).toBeDefined();
      });

      it('should handle failed file write', async () => {
        mockSocket.enrollment.lastSendEvent = FabreaderEventType.WRITE_FILES;

        const result = await state.onResponse({
          type: FabreaderEventType.WRITE_FILES,
          payload: { success: false, error: 'Write failed' },
        });

        expect(mockSocket.enrollment).toBeUndefined();
        expect(result).toBeDefined();
        // Verify the mock InitialReaderState was used
        expect(InitialReaderState).toHaveBeenCalled();
      });
    });
  });

  describe('Utility methods', () => {
    it('should convert Uint8Array to hex string', () => {
      const arr = new Uint8Array([0x01, 0x02, 0xff]);
      const hex = state.uint8ArrayToHexString(arr);
      expect(hex).toBe('0102ff');
    });

    it('should convert hex string to Uint8Array', () => {
      const hex = '0102ff';
      const arr = state.hexStringToUint8Array(hex);
      expect(arr).toEqual(new Uint8Array([0x01, 0x02, 0xff]));
    });
  });
});

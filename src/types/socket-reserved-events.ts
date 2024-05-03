import type { Socket } from 'socket.io-client';

// not exported from socket.io-client
export type DisconnectDescription =
  | Error
  | {
      description: string;
      context?: unknown;
    };

export type SocketReservedEvents = {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (
    reason: Socket.DisconnectReason,
    description?: DisconnectDescription
  ) => void;
};

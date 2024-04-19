import type { Socket } from 'socket.io-client';
import type { DisconnectDescription } from 'socket.io-client/build/esm/socket';

export type SocketReservedEvents = {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (
    reason: Socket.DisconnectReason,
    description?: DisconnectDescription
  ) => void;
};

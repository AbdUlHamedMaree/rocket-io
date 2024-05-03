import type { ManagerOptions, SocketOptions } from 'socket.io-client';
import { io, Socket } from 'socket.io-client';
import type { EventsMap } from '../types/events-map';

export const getSocket = <
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
>(
  uriOrSocket?: string | Socket | Partial<ManagerOptions & SocketOptions>,
  baseOptions?: Partial<ManagerOptions & SocketOptions> | undefined
): Socket<TListenEvents, TEmitEvents> | undefined => {
  if (uriOrSocket instanceof Socket) {
    return uriOrSocket;
  }

  if (typeof uriOrSocket === 'string') {
    return io(uriOrSocket, baseOptions);
  }

  if (uriOrSocket != null) {
    return io(uriOrSocket);
  }
};

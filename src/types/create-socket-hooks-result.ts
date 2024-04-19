import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import type { EventsMap } from './events-map';
import type { SocketReservedEvents } from './socket-reserved-events';

export type CreateSocketHooksResult<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
> = {
  socket: Socket<TListenEvents, TEmitEvents> | undefined;
  useInitSocket: (
    uri?: string,
    options?: Partial<ManagerOptions & SocketOptions>,
    start?: boolean
  ) => void;
  useDisconnectOnUnmount: () => void;
  useSocket: () => Socket<TListenEvents, TEmitEvents> | undefined;
  useOn: <TKey extends keyof TListenEvents | keyof SocketReservedEvents>(
    ev: TKey,
    listener: (TListenEvents & SocketReservedEvents)[TKey]
  ) => void;
  useOnce: <TKey extends keyof TListenEvents | keyof SocketReservedEvents>(
    ev: TKey,
    listener: (TListenEvents & SocketReservedEvents)[TKey]
  ) => void;
  useEmit: () => <TKey extends keyof TEmitEvents>(
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => undefined;
  useImmediateEmit: <TKey extends keyof TEmitEvents>(
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => void;
  useEmitEffect: <TKey extends keyof TEmitEvents>(
    deps: unknown[],
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => void;
};
import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import type { EventsMap } from './events-map';
import type { SocketReservedEvents } from './socket-reserved-events';

export type CreateSocketHooksResult<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
> = {
  /** the io socket */
  socket: Socket<TListenEvents, TEmitEvents> | undefined;

  /**
   * a hook to initialize the socket in case of lazy initialization
   * @param uri uri for socket initialization, it will be passed like `io(uri)`
   * @param options options for socket initialization, it will be passed like `io(, options)`
   * @param start wither to start initializing or not, use it when you're waiting on data to initialize and the data isn't ready
   */
  useInitSocket: (
    uri?: string,
    options?: Partial<ManagerOptions & SocketOptions>,
    start?: boolean
  ) => void;

  /** hook to disconnect the socket on component unmount, use it your app */
  useDisconnectOnUnmount: () => void;

  /**
   * hook to return the current socket
   * @returns the socket
   */
  useSocket: () => Socket<TListenEvents, TEmitEvents> | undefined;

  /**
   * hook to listen to socket event
   * @param ev event name
   * @param listener listener function
   */
  useOn: <TKey extends keyof TListenEvents | keyof SocketReservedEvents>(
    ev: TKey,
    listener: (TListenEvents & SocketReservedEvents)[TKey]
  ) => void;

  /**
   * hook to listen to socket event once
   * @param ev event name
   * @param listener listener function
   */
  useOnce: <TKey extends keyof TListenEvents | keyof SocketReservedEvents>(
    ev: TKey,
    listener: (TListenEvents & SocketReservedEvents)[TKey]
  ) => void;

  /**
   * hook to get the socket emit fn, this emit is optimized to hold emission until the socket is ready
   * @returns optimized socket emit fn
   */
  useEmit: () => Socket<TListenEvents, TEmitEvents>['emit'];

  /**
   * hook to emit socket event immediately
   * @param ev event name
   * @param args event arguments
   */
  useImmediateEmit: <TKey extends keyof TEmitEvents>(
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => void;

  /**
   * hook to emit socket event any time the dependency array changes
   * @param deps dependency array
   * @param ev event name
   * @param args event arguments
   */
  useEmitEffect: <TKey extends keyof TEmitEvents>(
    deps: unknown[],
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => void;
};

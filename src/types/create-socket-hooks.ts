/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import type { EventsMap } from './events-map';
import type { CreateSocketHooksResult } from './create-socket-hooks-result';

export type CreateSocketHook = {
  <
    TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
    TEmitEvents extends EventsMap = TListenEvents,
  >(
    socket: Socket<TListenEvents, TEmitEvents>
  ): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

  <
    TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
    TEmitEvents extends EventsMap = TListenEvents,
  >(
    options: Partial<ManagerOptions & SocketOptions>
  ): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

  <
    TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
    TEmitEvents extends EventsMap = TListenEvents,
  >(
    uri: string,
    options?: Partial<ManagerOptions & SocketOptions>
  ): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

  <
    TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
    TEmitEvents extends EventsMap = TListenEvents,
  >(): CreateSocketHooksResult<TListenEvents, TEmitEvents>;
};

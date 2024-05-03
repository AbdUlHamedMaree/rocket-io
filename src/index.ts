/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from 'eventemitter3';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { io } from 'socket.io-client';

import { isDefined, isNil } from './utils/checks';
import type { EventsMap } from './types/events-map';
import { getSocket } from './utils/get-socket';
import type { CreateSocketHooksResult } from './types/create-socket-hooks-result';
import type { SocketReservedEvents } from './types/socket-reserved-events';

export function createSocketHooks<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
>(
  socket: Socket<TListenEvents, TEmitEvents>
): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

export function createSocketHooks<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
>(
  options: Partial<ManagerOptions & SocketOptions>
): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

export function createSocketHooks<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
>(
  uri: string,
  options?: Partial<ManagerOptions & SocketOptions>
): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

export function createSocketHooks<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
>(): CreateSocketHooksResult<TListenEvents, TEmitEvents>;

export function createSocketHooks<
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents,
>(
  uriOrSocket?:
    | string
    | Socket<TListenEvents, TEmitEvents>
    | Partial<ManagerOptions & SocketOptions>,
  baseOptions?: Partial<ManagerOptions & SocketOptions>
): CreateSocketHooksResult<TListenEvents, TEmitEvents> {
  const eventEmitter = new EventEmitter();

  let socketInstance = getSocket<TListenEvents, TEmitEvents>(uriOrSocket, baseOptions);

  const useInitSocket = (
    uri?: string,
    options?: Partial<ManagerOptions & SocketOptions>,
    start = true
  ) => {
    useLayoutEffect(() => {
      if (!start) return;
      if (isDefined(socketInstance)) return;

      if (isNil(uri))
        throw new Error('provide a uri in either createSocketHooks or in useInitSocket');

      const socket = io(uri, options);

      socketInstance = socket;
      eventEmitter.emit('socket-done', socket);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start]);
  };

  const useDisconnectOnUnmount = () => {
    useEffect(() => {
      return () => {
        socketInstance?.disconnect();
      };
    }, []);
  };

  const useSocket = () => {
    const [socketState, setSocketState] = useState(socketInstance);

    useEffect(() => {
      if (isDefined(socketState)) return;
      if (isDefined(socketInstance)) return void setSocketState(socketInstance);

      eventEmitter.on('socket-done', setSocketState);

      return () => {
        eventEmitter.off('socket-done', setSocketState);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return socketState;
  };

  const useOn = <TKey extends keyof (TListenEvents & SocketReservedEvents)>(
    ev: TKey,
    listener: (TListenEvents & SocketReservedEvents)[TKey]
  ) => {
    const socket = useSocket();

    useEffect(() => {
      if (isNil(socket)) return;

      socket.on(ev as any, listener);

      return () => {
        socket.off(ev as any, listener);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listener, ev, socket]);
  };

  const useOnce = <TKey extends keyof (TListenEvents & SocketReservedEvents)>(
    ev: TKey,
    listener: (TListenEvents & SocketReservedEvents)[TKey]
  ) => {
    const socket = useSocket();

    useEffect(() => {
      if (isNil(socket)) return;

      socket.once(ev as any, listener);

      return () => {
        socket.off(ev as any, listener);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listener, ev, socket]);
  };

  const useEmit = () => {
    const socket = useSocket();

    const queue = useRef<
      [keyof TEmitEvents, Parameters<TEmitEvents[keyof TEmitEvents]>][]
    >([]);

    useEffect(() => {
      if (isNil(socket) || queue.current.length === 0) return;

      queue.current.forEach(([ev, ...args]) => socket.emit(ev as any, ...(args as any)));
      queue.current = [];
    }, [socket]);

    return useCallback(
      <TKey extends keyof TEmitEvents>(
        ev: TKey,
        ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
      ) => {
        if (isNil(socketInstance)) return void queue.current.push([ev, ...args] as any);

        socketInstance.emit(ev as any, ...args);
      },
      []
    );
  };

  const useEmitEffect = <TKey extends keyof TEmitEvents>(
    deps: unknown[],
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => {
    const emit = useEmit();

    useEffect(() => {
      emit(ev, ...args);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  };

  const useImmediateEmit = <TKey extends keyof TEmitEvents>(
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => useEmitEffect([], ev, ...args);

  return {
    socket: socketInstance,
    useInitSocket,
    useDisconnectOnUnmount,
    useSocket,
    useOn,
    useOnce,
    useEmit,
    useImmediateEmit,
    useEmitEffect,
  };
}

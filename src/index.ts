/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events';
import { useCallback, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import {} from 'socket.io-client/build/esm/index';
import type { DisconnectDescription } from 'socket.io-client/build/esm/socket';
import { isDefined, isNil } from './checks';

export type SocketReservedEvents = {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (
    reason: Socket.DisconnectReason,
    description?: DisconnectDescription
  ) => void;
};

type EventsMap = Record<string, (...args: any[]) => void>;

export const createSocketHooks = <
  TListenEvents extends EventsMap = Record<string, (...args: any[]) => void>,
  TEmitEvents extends EventsMap = TListenEvents
>(
  baseUri?: string,
  baseOptions?: Partial<ManagerOptions & SocketOptions>
) => {
  const eventEmitter = new EventEmitter();
  let socketInstance: Socket<TListenEvents, TEmitEvents> | undefined;

  const useInitSocket = (
    uri?: string,
    options?: Partial<ManagerOptions & SocketOptions>,
    start = true
  ) => {
    useEffect(() => {
      if (!start) return;
      const finalUri = uri ?? baseUri;
      if (isNil(finalUri))
        throw new Error('provide a uri in either createSocketHooks or in useInitSocket');

      const s = io(finalUri, { ...baseOptions, ...options });
      socketInstance = s;
      eventEmitter.emit('socket-done', s);
      return () => {
        socketInstance = undefined;
        eventEmitter.emit('socket-done', undefined);
        s.disconnect();
      };
    }, [options, uri, start]);
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
    }, [deps]);
  };

  const useImmediateEmit = <TKey extends keyof TEmitEvents>(
    ev: TKey,
    ...args: Parameters<TEmitEvents[keyof TEmitEvents]>
  ) => useEmitEffect([], ev, ...args);
  return {
    socket: socketInstance,
    eventEmitter,
    useInitSocket,
    useSocket,
    useOn,
    useOnce,
    useEmit,
    useImmediateEmit,
    useEmitEffect,
  };
};

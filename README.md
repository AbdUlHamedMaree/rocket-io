# @mrii/react-socket.io

library to wrap socket.io-client usage for react apps.

# Install

```sh
yarn add @mrii/react-socket.io

# or using npm

npm i @mrii/react-socket.io
```

# Usage

first: call the `createSocketHooks` to get an instance of the hooks with the socket

`socket.io-hooks.ts`

```ts
import { createSocketHooks } from '@mrii/react-socket.io';

// exports the hooks
export const {
  useInitSocket,
  useSocket,
  useOn,
  useOnce,
  useEmit,
  useImmediateEmit,
  useEmitEffect,
  // optionally pass args, you can pass them later using `useInitSocket`
} = createSocketHooks('socket-uri', { reconnection: true });
```

second: call the `useInitSocket` to initialize the socket in your app.

`app.tsx`

```tsx
const App: React.FC = () => {
  // ...

  // optionally pass args, if you already pass them from `createSocketHooks`
  useInitSocket('socket-uri', useMemo({ timeout: 4000 }, []));

  // ...
};
```

then you can use the hooks in your app

`component.tsx`

```tsx
const Component: React.FC = () => {
  // ...

  // optionally pass args, if you already pass them from `createSocketHooks`
  useOn('data', useCallback(data => {
    console.log('[data] event fired with: ', data);
  },[]);

  const emit = useEmit();
  <button onClick={() => emit('data', { message: 'new data emitted!' })}>
    sendData
  </button>;
};
```

# API

## `createSocketHooks`

function that creates a socket instance and return the hooks.

| Property     | Type                                       | Default     | Description                      | Version |
| ------------ | ------------------------------------------ | ----------- | -------------------------------- | ------- |
| arg0:uri     | `string?`                                  | `undefined` | socket uri (`io(uri)`)           | 0.1     |
| arg1:options | `Partial<ManagerOptions & SocketOptions>?` | `undefined` | socket options (`io(, options)`) | 0.1     |

return: `void`

---

## `useInitSocket`

hook to init your socket in the app.

| Property     | Type                                       | Default     | Description                      | Version |
| ------------ | ------------------------------------------ | ----------- | -------------------------------- | ------- |
| arg0:uri     | `string?`                                  | `undefined` | socket uri (`io(uri)`)           | 0.1     |
| arg1:options | `Partial<ManagerOptions & SocketOptions>?` | `undefined` | socket options (`io(, options)`) | 0.1     |
| arg2:start   | `boolean?`                                 | `true`      | start initializing the socket    | 0.1     |

return: `void`

---

## `useSocket`

hook that returns the instance of the socket.

take no args

return: `Socket<DefaultEventsMap, DefaultEventsMap> | undefined`

---

## `useOn`

hook to listen on every event emission.

| Property      | Type       | Default     | Description                                                                      | Version |
| ------------- | ---------- | ----------- | -------------------------------------------------------------------------------- | ------- |
| arg0:key      | `string`   | `undefined` | event key to listen on (`socket.on(key)`)                                        | 0.1     |
| arg1:listener | `Function` | `undefined` | listener that will will be called when the event fires (`socket.on(, listener)`) | 0.1     |

return: `void`

---

## `useOnce`

hook to listen once on event emission.

| Property      | Type       | Default     | Description                                                                        | Version |
| ------------- | ---------- | ----------- | ---------------------------------------------------------------------------------- | ------- |
| arg0:key      | `string`   | `undefined` | event key to listen on (`socket.once(key)`)                                        | 0.1     |
| arg1:listener | `Function` | `undefined` | listener that will will be called when the event fires (`socket.once(, listener)`) | 0.1     |

return: `void`

---

## `useEmit`

hook that return the `socket.emit` function.

take no args.

return: `socket.emit` function.

---

## `useImmediateEmit`

hook to emit an event once.

| Property | Type        | Default     | Description                                             | Version |
| -------- | ----------- | ----------- | ------------------------------------------------------- | ------- |
| arg0:key | `string`    | `undefined` | event key to emit (`socket.emit(key)`)                  | 0.1     |
| ...args  | `unknown[]` | `undefined` | extra arguments to emit them (`socket.emit(, ...args)`) | 0.1     |

return: `void`

---

## `useEmitEffect`

hook to emit an event once the dependency array changes.

| Property  | Type        | Default     | Description                                              | Version |
| --------- | ----------- | ----------- | -------------------------------------------------------- | ------- |
| arg0:deps | `unknown[]` | `undefined` | dependency array to listen on (like `useEffect(, deps)`) | 0.1     |
| arg1:key  | `string`    | `undefined` | event key to emit (`socket.emit(key)`)                   | 0.1     |
| ...args   | `unknown[]` | `undefined` | extra arguments to emit them (`socket.emit(, ...args)`)  | 0.1     |

return: `void`

# NOTES

- `createSocketHooks` also returns the actual socket, but be carful when use it because it could be `undefined` on mount, but it's exported for some use cases.

- try to use the hooks (`useEmit`, `useOn`, ...) instead of getting the `socket` from `useSocket` and use it, because there some extra cases handled in those hooks.

- memoize the following arguments (not memoizing them may cause some unexpected behavior):
  - the options object passed to `useInitSocket`.
  - the listener passed to `useOn` and `useOnce`.

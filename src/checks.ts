export const isNil = <T>(value: T): value is Extract<T, null | undefined> =>
  value == null;

export const isDefined = <T>(value: T): value is Exclude<T, null | undefined> =>
  !isNil(value);

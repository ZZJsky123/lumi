type SetStateInternal<T> = {
  _(
    partial:
      | T
      | Partial<T>
      | { _(state: T): T | Partial<T>; replace?: boolean | undefined },
    replace?: boolean | undefined
  ): void;
}["_"];

export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState: () => T;
  subscribe: (listrener: (state: T, prevState: T) => void) => () => void;
  destory: () => void;
}

export interface StoreMutators<S, A> {}
export type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;

type Get<T, K, F> = K extends keyof T ? T[K] : F;

export type Mutate<S, Ms> = number extends Ms["length" & keyof Ms]
  ? S
  : Ms extends []
  ? S
  : Ms extends [[infer Mi, infer Ma], ...infer Mrs]
  ? Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
  : never;

export type StateCreator<
  T,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  U = T
> = (
  setState: Get<Mutate<StoreApi<T>, Mis>, "setState", never>,
  getState: Get<Mutate<StoreApi<T>, Mis>, "getState", never>,
  store: Mutate<StoreApi<T>, Mis>
) => U;

type CreateStore = {
  <T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>
  ): Mutate<StoreApi<T>, Mos>;
  <T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(
    initializer: StateCreator<T, [], Mos>
  ) => Mutate<StoreApi<T>, Mos>;
};

type CreateStoreImpl = <
  T,
  Mos extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, [], Mos>
) => Mutate<StoreApi<T>, Mos>;

const createStoreImpl: CreateStoreImpl = (createState) => {
  type TState = ReturnType<typeof createState>;
  type Listener = (state: TState, prevState: TState) => void;
  let state: TState;
  const listeners: Set<Listener> = new Set();

  const setState: StoreApi<TState>["setState"] = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state =
        replace ?? (typeof nextState !== "object" || nextState === null)
          ? (nextState as TState)
          : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState = () => state;

  const subscribe: StoreApi<TState>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destory = () => {
    listeners.clear();
  };

  const api = { setState, getState, subscribe, destory };
  state = createState(setState, getState, api);
  return api as any;
};

export const createStore = ((createState) => {
  createState ? createStoreImpl(createState) : createStoreImpl;
}) as CreateStore;

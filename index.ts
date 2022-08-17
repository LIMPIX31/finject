import { parse, StackFrame } from 'stack-trace'

export interface Metadata<T> {
  stacktrace: StackFrame[]
  target: T,
  noreturn: () => void
}

export interface PrototypeMetadata<T, O> extends Metadata<T> {
  object: O
}

export default function inject<T extends (...args: any[]) => any, P extends Parameters<T>, R extends ReturnType<T>, K extends keyof R, N extends Parameters<R[K]>>(target: T, cb: (meta: Metadata<T>, ...args: P) => R | undefined | void): T
export default function inject<T extends (...args: any[]) => any, P extends Parameters<T>, R extends ReturnType<T>, K extends keyof R, N extends Parameters<R[K]>>(prototype: R, method: K, cb: (meta: PrototypeMetadata<R[K], R>, ...args: N) => ReturnType<R[K]> | undefined | void): T
export default function inject<T extends (...args: any[]) => any, P extends Parameters<T>, R extends ReturnType<T>, K extends keyof R, N extends Parameters<R[K]>>(prototype: R, method: string | symbol, cb: (meta: PrototypeMetadata<R[K], R>, ...args: N) => ReturnType<R[K]> | undefined | void): T
export default function inject<T extends (...args: any[]) => any, P extends Parameters<T>, R extends ReturnType<T>, K extends keyof R, N extends Parameters<R[K]>>(target: T | R, cbm: K | string | symbol | ((meta: Metadata<T>, ...args: P) => R | undefined | void), cb?: (meta: PrototypeMetadata<R[K], R>, ...args: N) => ReturnType<R[K]> | undefined | void): T {
  let noreturn = false
  if (typeof cbm === 'symbol' || typeof cbm === 'string' || typeof cbm === 'number') {
    const original = (<R>target)[cbm]
    ;(<R>target)[cbm] = function (...args: N) {
      const modifiedReturn = cb?.({
        stacktrace: parse(new Error()).slice(1),
        target: original.bind(this),
        noreturn: () => noreturn = true,
        object: this
      }, ...args)
      return noreturn ? undefined : (modifiedReturn ?? (original.bind(this))(...args))
    }
    return (<R>target)[cbm]
  } else {
    return ((...args: P) => {
      const modifiedReturn = cbm({
        stacktrace: parse(new Error()).slice(1),
        target,
        noreturn: () => noreturn = true
      }, ...args)
      return noreturn ? undefined : (modifiedReturn ?? (<T>target)(...args))
    }) as T
  }
}

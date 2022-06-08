import { parse, StackFrame } from 'stack-trace'

export interface Metadata<T> {
  stacktrace: StackFrame[]
  target: T,
  noreturn: () => void
}

export default <T extends (...args: any[]) => any, P extends Parameters<T>>(target: T, cb: (meta: Metadata<T>, ...args: P) => ReturnType<T> | undefined | void): T =>
  ((...args: P) => {
    let noreturn
    const metadata: Metadata<T> = {
      stacktrace: parse(new Error()).slice(1),
      target,
      noreturn: () => noreturn = true
    }
    const modifiedReturn = cb(metadata, ...args)
    return !noreturn && (modifiedReturn ?? target(...args))
  }) as T

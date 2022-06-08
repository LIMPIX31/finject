# Flinject - Typed function injector
Inject any code into any function without worrying about types.

## 👉 Simple example
```ts
import inject from 'flinject'

self.eval = inject(self.eval, () => console.log('Eval used!'))
```

## 👍 Useful example
```ts
import inject from 'flinject'

Buffer.alloc = inject(Buffer.alloc, ({ target, stacktrace }, size) => {
  if(size < 1024) return
  const at = stacktrace[0]
  console.log(`WARNING: Trying to allocate buffer larger than 1024 with (${size} bytes)\n At: ${at.getFileName()} ${at.getLineNumber()}:${at.getColumnNumber()}`)
  return target(1024) // Use `target` instead of original function( e.g. Buffer.alloc ) to avoid stack overflow
})

const buf = Buffer.alloc(1025) // Trying to allocate buffer larger than 1024 with (1025 bytes)
console.log(buf.length) // 1024
```

## ℹ️ Specific usage
If you need to suppress the return value, use `noreturn()`. 

⚠️ Use `noreturn` only when the target function is allowed to return `undefined`.

```ts
let target = (a, b) => a / b

// ❌ Incorrect usage
target = flinject(target, (meta, a, b) => {
  if(b !== 0) return
  console.log(`Divide by zero!`)
  return undefined
})

// ✅ Correct usage
target = flinject(target, ({ noreturn }, a, b) => {
  if(b !== 0) return
  console.log(`Divide by zero!`)
  noreturn()
})
```
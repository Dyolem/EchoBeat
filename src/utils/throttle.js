export function throttle(func, delay, executeLast = false) {
  let hasExecuted = false
  let timeoutId
  let lastExecute = false
  return function () {
    const context = this
    const args = arguments
    if (!hasExecuted) {
      func.apply(context, args)
      hasExecuted = true
      timeoutId = setTimeout(function () {
        hasExecuted = false
        if (executeLast && lastExecute && !hasExecuted) {
          func.apply(context, args)
          lastExecute = false
        }
        clearTimeout(timeoutId)
      }, delay)
    } else {
      lastExecute = true
    }
  }
}

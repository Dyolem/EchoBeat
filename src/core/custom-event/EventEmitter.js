export class EventEmitter {
  #eventMap = new Map()
  #maxListeners = 20

  static captureRejections = false
  constructor() {}
  #createWrapperOn({ isOnce = false, isPre = false, signal } = {}) {
    function onceWrapper(listener, isOnce = false) {
      if (isOnce) {
        onceWrapper["listener"] = listener
        return onceWrapper
      } else {
        return listener
      }
    }
    // return isOnce ? (onceWrapper["listener"] = listener) : listener;

    function addListener(eventName, listener) {
      if (!this.#eventMap.has(eventName)) {
        this.#eventMap.set(eventName, [])
      }
      if (signal instanceof AbortSignal)
        signal.addEventListener(
          "abort",
          () => {
            this.removeListener(eventName, listener)
          },
          { once: true },
        )
      const eventQueue = this.#eventMap.get(eventName)
      if (eventQueue.length <= this.#maxListeners) {
        if (isPre) {
          eventQueue.unshift(onceWrapper(listener, isOnce))
        } else {
          eventQueue.push(onceWrapper(listener, isOnce))
        }
      } else {
        throw new Error(
          "The number of listeners for the same event exceeded the maximum registered value. Procedure",
        )
      }
    }
    return addListener.bind(this)
  }
  on(eventName, listener, { once, signal } = {}) {
    const wrapperOn = this.#createWrapperOn({ isOnce: once, signal })
    wrapperOn(eventName, listener)

    return this
  }
  prependListener(eventName, listener, signal) {
    const wrapperOn = this.#createWrapperOn({ isPre: true, signal })
    wrapperOn(eventName, listener)

    return this
  }
  addListener = this.on
  once(eventName, listener, signal) {
    const wrapperOn = this.#createWrapperOn({ isOnce: true, signal })
    wrapperOn.listener(eventName, listener)

    return this
  }
  prependOnceListener(eventName, listener, signal) {
    const wrapperOn = this.#createWrapperOn({
      isOnce: true,
      isPre: true,
      signal,
    })
    wrapperOn(eventName, listener)

    return this
  }
  emit(eventName, ...params) {
    const executeQueue = this.rawListeners(eventName) || []
    for (const func of executeQueue) {
      let executeFunc = func
      if (typeof func.listener === "function") {
        func.listener(...params)
        this.removeListener(eventName, func.listener)
      } else {
        executeFunc(...params)
      }
    }

    return executeQueue !== undefined && executeQueue.length !== 0
  }
  listeners(eventName) {
    if (!eventName) throw new Error("Registering the event name is required")
    const rawListenerArr = []
    const executeQueue = this.#eventMap.get(eventName) || []
    for (const func of executeQueue) {
      if (typeof func.listener === "function") {
        rawListenerArr.push(func.listener)
      } else {
        rawListenerArr.push(func)
      }
    }
    return rawListenerArr
  }
  rawListeners(eventName) {
    if (!eventName) throw new Error("Registering the event name is required")
    return this.#eventMap.get(eventName) || []
  }
  listenerCount(eventName, listener) {
    let count = 0
    const listenerQueue = this.#eventMap.get(eventName) || []
    count = listenerQueue.length
    if (listener) {
      let sameFuncCount = 0
      for (const func of listenerQueue) {
        if (listener === func) {
          sameFuncCount++
        }
      }
      count = sameFuncCount
    }

    return count
  }
  eventNames() {
    return [...this.#eventMap.keys()]
  }
  removeListener(eventName, listener) {
    const executeQueue = this.rawListeners(eventName)
    const removedExecuteQueue = []
    for (const func of executeQueue) {
      if (listener !== func && listener !== func.listener) {
        removedExecuteQueue.push(func)
      } else {
        continue
      }
    }
    this.#eventMap.set(eventName, removedExecuteQueue)
    return this
  }
  off = this.removeListener
  removeAllListeners(eventName) {
    if (eventName !== undefined) {
      for (const eventKey of this.#eventMap.keys()) {
        this.#eventMap.set(eventKey, [])
      }
    } else {
      this.#eventMap.set(eventName, [])
    }
    return this
  }

  setMaxListeners(n) {
    let max = 0
    if (n === 0 || n === Number.POSITIVE_INFINITY) {
      max = Number.POSITIVE_INFINITY
    } else {
      throw new Error(
        "The number of listeners must be greater than or equal to 0",
      )
    }
    this.#maxListeners = max
    return this
  }
}

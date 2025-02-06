export function deepClone(target, map = new WeakMap()) {
  // 处理基本类型和函数
  if (typeof target !== "object" || target === null) {
    return target
  }

  // 处理循环引用
  if (map.has(target)) {
    return map.get(target)
  }

  // 根据类型创建初始对象
  const type = Object.prototype.toString.call(target)
  let cloned

  switch (type) {
    case "[object Array]":
      cloned = []
      map.set(target, cloned)
      for (let i = 0; i < target.length; i++) {
        if (Object.prototype.hasOwnProperty.call(target, i)) {
          cloned[i] = deepClone(target[i], map)
        }
      }
      break

    case "[object Object]":
      cloned = Object.create(Object.getPrototypeOf(target))
      map.set(target, cloned)
      Reflect.ownKeys(target).forEach((key) => {
        cloned[key] = deepClone(target[key], map)
      })
      break

    case "[object Date]":
      cloned = new Date(target.getTime())
      map.set(target, cloned)
      break

    case "[object RegExp]":
      cloned = new RegExp(target.source, target.flags)
      cloned.lastIndex = target.lastIndex
      map.set(target, cloned)
      break

    case "[object Map]":
      cloned = new Map()
      map.set(target, cloned)
      target.forEach((value, key) => {
        cloned.set(deepClone(key, map), deepClone(value, map))
      })
      break

    case "[object Set]":
      cloned = new Set()
      map.set(target, cloned)
      target.forEach((value) => {
        cloned.add(deepClone(value, map))
      })
      break

    default:
      // 处理其他未支持的类型（如Error、Promise等），直接返回原对象
      cloned = target
      break
  }

  return cloned
}

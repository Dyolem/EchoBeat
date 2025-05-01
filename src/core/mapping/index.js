/**
 * 将任意数据结构中的Map转换为可JSON序列化的对象
 * @param {any} data - 要转换的数据，可以是任意类型
 * @returns {any} - 转换后的可序列化数据
 */
export function mapToSerializable(data) {
  // 处理null或undefined
  if (data == null) {
    return data
  }

  // 处理Map类型
  if (data instanceof Map) {
    const result = {
      __type: "Map",
      data: [],
    }

    // 遍历Map将键值对转换为数组
    for (const [key, value] of data.entries()) {
      result.data.push([key, mapToSerializable(value)])
    }

    return result
  }

  // 处理数组
  if (Array.isArray(data)) {
    return data.map((item) => mapToSerializable(item))
  }

  // 处理对象
  if (typeof data === "object") {
    const result = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = mapToSerializable(data[key])
      }
    }
    return result
  }

  // 处理原始类型，直接返回
  return data
}

/**
 * 将序列化后的数据还原为原始结构（包括Map）
 * @param {any} data - 序列化后的数据
 * @returns {any} - 恢复后的数据
 */
export function serializableToMap(data) {
  // 处理null或undefined
  if (data == null) {
    return data
  }

  // 处理序列化的Map
  if (
    data &&
    typeof data === "object" &&
    data.__type === "Map" &&
    Array.isArray(data.data)
  ) {
    const map = new Map()
    for (const [key, value] of data.data) {
      map.set(key, serializableToMap(value))
    }
    return map
  }

  // 处理数组
  if (Array.isArray(data)) {
    return data.map((item) => serializableToMap(item))
  }

  // 处理对象
  if (typeof data === "object") {
    const result = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializableToMap(data[key])
      }
    }
    return result
  }

  // 处理原始类型，直接返回
  return data
}

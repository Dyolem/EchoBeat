/**
 * 随机值工具集
 */
export const randomUtils = {
  /**
   * 获取一个指定范围内的随机整数，包含 min 和 max
   *
   * 示例：
   * ```js
   * randomUtils.getRandomInt(1, 100); // 返回 1 到 100 之间的随机整数
   * ```
   *
   * @param {number} min - 随机数的最小值
   * @param {number} max - 随机数的最大值
   * @returns {number} 随机整数
   */
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /**
   * 获取一个指定范围内的随机浮动数，包含 min 和 max
   *
   * 示例：
   * ```js
   * randomUtils.getRandomFloat(1.5, 3.5); // 返回 1.5 到 3.5 之间的随机浮动数
   * ```
   *
   * @param {number} min - 随机浮动数的最小值
   * @param {number} max - 随机浮动数的最大值
   * @returns {number} 随机浮动数
   */
  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min
  },

  /**
   * 从数组中随机选择一个元素
   *
   * 示例：
   * ```js
   * randomUtils.getRandomElement([10, 20, 30, 40]); // 返回数组中一个随机元素，如 20
   * ```
   *
   * @param {Array} arr - 要从中选择的数组
   * @returns {*} 随机选中的元素
   * @throws {Error} 如果输入的不是数组，抛出错误
   */
  getRandomElement(arr) {
    if (!Array.isArray(arr)) {
      throw new Error("Input must be an array")
    }
    const index = this.getRandomInt(0, arr.length - 1)
    return arr[index]
  },

  /**
   * 生成指定长度的随机字符串，支持自定义字符集
   *
   * 示例：
   * ```js
   * randomUtils.getRandomString(10); // 返回长度为 10 的随机字符串
   * randomUtils.getRandomString(10, 'abc123'); // 返回长度为 10 的字符串，字符集为 'abc123'
   * ```
   *
   * @param {number} [length=8] - 生成的随机字符串的长度，默认为8
   * @param {string} [chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'] - 可选的字符集，默认为字母和数字
   * @returns {string} 生成的随机字符串
   */
  getRandomString(
    length = 8,
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ) {
    let result = ""
    const charLength = chars.length
    for (let i = 0; i < length; i++) {
      result += chars.charAt(this.getRandomInt(0, charLength - 1))
    }
    return result
  },

  /**
   * 生成随机布尔值
   *
   * 示例：
   * ```js
   * randomUtils.getRandomBoolean(); // 返回 true 或 false
   * ```
   *
   * @returns {boolean} 随机布尔值，`true` 或 `false`
   */
  getRandomBoolean() {
    return Math.random() < 0.5
  },

  /**
   * 获取指定权重下的随机值
   *
   * 示例：
   * ```js
   * randomUtils.getRandomWeighted([10, 20, 30]); // 返回值 0, 1 或 2，按权重 10:20:30 随机选择
   * ```
   *
   * @param {number[]} weights - 权重数组，每个元素对应一个选择项的权重
   * @returns {number} 选择的项的索引
   * @throws {Error} 如果输入的权重数组无效，抛出错误
   */
  getRandomWeighted(weights) {
    if (!Array.isArray(weights) || weights.some((w) => typeof w !== "number")) {
      throw new Error("Input must be an array of numbers")
    }
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0)
    const random = Math.random() * totalWeight
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
      if (random < sum) {
        return i
      }
    }
  },
}

// 使用示例：

// 获取随机整数
console.log(randomUtils.getRandomInt(1, 100)) // 随机整数，范围1到100

// 获取随机浮动数
console.log(randomUtils.getRandomFloat(1.5, 3.5)) // 随机浮动数，范围1.5到3.5

// 从数组中随机选择一个元素
console.log(randomUtils.getRandomElement([10, 20, 30, 40])) // 随机选择数组中的一个元素

// 生成随机字符串
console.log(randomUtils.getRandomString(10)) // 生成一个长度为10的随机字符串

// 获取随机布尔值
console.log(randomUtils.getRandomBoolean()) // 返回 true 或 false

// 获取随机权重值
console.log(randomUtils.getRandomWeighted([10, 20, 30])) // 按照权重随机选择索引

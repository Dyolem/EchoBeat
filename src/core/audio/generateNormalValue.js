import { randomUtils } from "@/utils/randomUtils.js"

/**
 * 生成符合正态分布的随机值（限制在指定范围内）
 * @param {number[]} range - 随机值 的最小值和最大值，例如 [20, 127]
 * @param {number} [mean] - 正态分布的均值（默认取范围中点）
 * @param {number} [stdDev] - 正态分布的标准差（默认取范围跨度的 1/4）
 * @returns {number} 符合正态分布且位于 range 内的整数值
 */
export function generateNormalValue(range, mean, stdDev) {
  const [min, max] = range
  // 默认均值为范围中点，标准差为范围跨度的 1/4
  if (mean === undefined) mean = (min + max) / 2
  if (stdDev === undefined) stdDev = (max - min) / 4

  // 生成正态分布随机数并限制在范围内
  let value
  do {
    value = Math.round(randomUtils.generateNormalRandom(mean, stdDev)) // 四舍五入为整数
  } while (value < min || value > max) // 确保值在范围内

  return value
}

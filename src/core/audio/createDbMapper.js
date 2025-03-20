/**
 * 创建分贝与滑块之间的双向映射函数
 * @param {Object} options 配置参数
 * @param {number} options.minDb 最小分贝值 (默认-70)
 * @param {number} options.maxDb 最大分贝值 (默认+6)
 * @param {number} options.exponent 曲线指数 (0-1, 默认0.5)
 * @returns {{dbToSlider: Function, sliderToDb: Function}} 映射函数对
 */
export function createDbMapper(options = {}) {
  const { minDb = -70, maxDb = 6, exponent = 0.5 } = options

  // 预计算归一化参数
  const powFactor = exponent || 0.5 // 防止传入0
  const scaledMin = Math.pow(10, minDb / 20) ** powFactor
  const scaledMax = Math.pow(10, maxDb / 20) ** powFactor
  const scaledRange = scaledMax - scaledMin

  return {
    /**
     * 将分贝值转换为滑块位置 (0-1)
     * @param {number} db 输入分贝值 (-Infinity 表示静音)
     */
    dbToSlider(db) {
      if (db === -Infinity) return 0
      const scaled = Math.pow(10, db / 20) ** powFactor
      return Math.max(0, (scaled - scaledMin) / scaledRange)
    },

    /**
     * 将滑块位置 (0-1) 转换为分贝值
     * @param {number} slider 滑块位置
     */
    sliderToDb(slider) {
      if (slider <= 0) return -Infinity
      const scaled = scaledMin + slider * scaledRange
      const db = 20 * Math.log10(scaled ** (1 / powFactor))
      return Math.min(db, maxDb)
    },
  }
}

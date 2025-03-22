/**
 * @typedef {Object} Rect 轴对齐矩形对象
 * @property {number} x - 矩形左上角X坐标
 * @property {number} y - 矩形左上角Y坐标
 * @property {number} width - 矩形宽度（必须为正数）
 * @property {number} height - 矩形高度（必须为正数）
 */

/**
 * 检查两个轴对齐的矩形是否存在交集
 * @param {Rect} rect1 - 第一个矩形对象
 * @param {Rect} rect2 - 第二个矩形对象
 * @returns {boolean} true表示存在交集，false表示不相交
 *
 * @example
 * // 返回 true（存在交集）
 * doRectanglesOverlap(
 *   { x: 0, y: 0, width: 10, height: 10 },
 *   { x: 5, y: 5, width: 10, height: 10 }
 * );
 *
 * @example
 * // 返回 false（仅边接触）
 * doRectanglesOverlap(
 *   { x: 0, y: 0, width: 10, height: 10 },
 *   { x: 10, y: 0, width: 10, height: 10 }
 * );
 */
export function doRectanglesOverlap(rect1, rect2) {
  // 计算矩形1的边界
  const rect1Left = rect1.x
  const rect1Right = rect1.x + rect1.width
  const rect1Top = rect1.y
  const rect1Bottom = rect1.y + rect1.height

  // 计算矩形2的边界
  const rect2Left = rect2.x
  const rect2Right = rect2.x + rect2.width
  const rect2Top = rect2.y
  const rect2Bottom = rect2.y + rect2.height

  // 检查x轴和y轴是否有重叠
  const xOverlap = rect1Left < rect2Right && rect2Left < rect1Right
  const yOverlap = rect1Top < rect2Bottom && rect2Top < rect1Bottom

  return xOverlap && yOverlap
}

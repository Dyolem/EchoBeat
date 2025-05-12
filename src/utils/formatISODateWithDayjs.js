import dayjs from "dayjs"

/**
 * @param {string} isoString - ISO格式的日期字符串，例如"2024-10-19T00:00:00.000Z"
 * @returns {string} 格式化后的日期字符串，例如"Oct 19, 2024"
 */
export function formatISODateWithDayjs(isoString) {
  try {
    // 使用dayjs解析日期并格式化
    // MMM: 月份简写 (Jan-Dec)
    // D: 日期，不补零 (1-31)
    // YYYY: 四位数年份
    return dayjs(isoString).format("MMM D, YYYY")
  } catch (error) {
    console.error("Error formatting date:", error)
    throw new Error("Invalid date string provided")
  }
}

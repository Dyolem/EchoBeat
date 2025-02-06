/**
 * @param {number} value
 * @param {[number,number]} scale
 * @returns {number}
 */
export const clamp = (value, scale) => {
  let [min, max] = scale
  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Array.isArray(scale)
  )
    throw new TypeError("Params type error")
  min = Math.min(min, max)
  max = Math.max(min, max)
  return Math.min(Math.max(value, min), max)
}

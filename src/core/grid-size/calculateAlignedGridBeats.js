import { GRID_OPTIONS } from "@/constants/daw/index.js"

/**
 * 计算一个网格所占节拍数。以一个四分音符占据一个完整节拍，ticks为480为基准
 * @param {number} timeSigN
 * @param {number} timeSigM
 * @param {string} gridOption
 * @returns {number|any}
 */
export function calculateAlignedGridBeats({ timeSigN, timeSigM, gridOption }) {
  if (gridOption === GRID_OPTIONS.bar) {
    return timeSigN
  } else if (gridOption.includes("T")) {
    const k = gridOption.split("T")[0].split("/")[1]
    return (2 * timeSigM) / (3 * Number(k))
  } else {
    const k = gridOption.split("/")[1]
    return timeSigM / Number(k)
  }
}

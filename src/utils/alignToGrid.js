import { ALIGN_TYPE } from "@/constants/daw/index.js"

export function alignToGrid(value, { gridSize, alignType }) {
  if (!ALIGN_TYPE.includes(alignType)) {
    throw new Error(
      `Invalid mode: ${alignType}. Expected 'round', 'ceil' or 'floor'`,
    )
  }
  if (typeof value === "number" && typeof gridSize === "number") {
    return Math[alignType](value / gridSize) * gridSize
  }
  if (Array.isArray(value) && Array.isArray(gridSize)) {
    const [x, y] = value
    const [width, height] = gridSize
    return {
      x: Math[alignType](x / width) * width,
      y: Math[alignType](y / height) * height,
    }
  }
  throw new Error(`Invalid parameters`)
}

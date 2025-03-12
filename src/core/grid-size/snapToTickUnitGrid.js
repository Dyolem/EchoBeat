import { snapToGrid } from "@/utils/alignToGrid.js"
import { clamp } from "@/utils/clamp.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { SNAPPED_THRESHOLD } from "@/constants/daw/index.js"

/**
 * @param {Object} snapInfo
 * @param {string} snapInfo.editorId
 * @param {number} snapInfo.tickX
 * @param {[number,number]} snapInfo.tickScale
 * @param {boolean} [snapInfo.autoThreshold = false]
 * @returns {number}
 */
export function snapToTickUnitGrid({
  editorId,
  tickX,
  tickScale,
  autoThreshold = false,
}) {
  const beatControllerStore = useBeatControllerStore()
  const pixelsThreshold = SNAPPED_THRESHOLD
  const pixelsPerTick = beatControllerStore.pixelsPerTick(editorId)
  const factualDisplayedGridWidth =
    beatControllerStore.factualDisplayedGridWidth(editorId)
  let newTickX = tickX

  if (!autoThreshold) {
    const pixelsGridSize = factualDisplayedGridWidth * pixelsPerTick
    const pixelsX = tickX * pixelsPerTick
    const pixelsScale = tickScale.map((val) => val * pixelsPerTick)
    newTickX =
      snapToGrid(clamp(pixelsX, pixelsScale), {
        gridSize: pixelsGridSize,
        threshold: pixelsThreshold,
      }) / pixelsPerTick
  } else {
    const tickThreshold = pixelsThreshold / pixelsPerTick
    newTickX = snapToGrid(clamp(tickX, tickScale), {
      gridSize: factualDisplayedGridWidth,
      threshold: tickThreshold,
    })
  }
  return newTickX
}

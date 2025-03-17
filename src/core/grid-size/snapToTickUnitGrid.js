import { snapToGrid } from "@/utils/alignToGrid.js"
import { clamp } from "@/utils/clamp.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { SNAPPED_THRESHOLD } from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { storeToRefs } from "pinia"

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
  const zoomRatioStore = useZoomRatioStore()
  const { isSnappedToHorizontalGrid } = storeToRefs(zoomRatioStore)
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
    const clampedPixels = clamp(pixelsX, pixelsScale)
    newTickX =
      (isSnappedToHorizontalGrid.value
        ? snapToGrid(clampedPixels, {
            gridSize: pixelsGridSize,
            threshold: pixelsThreshold,
          })
        : clampedPixels) / pixelsPerTick
  } else {
    const tickThreshold = pixelsThreshold / pixelsPerTick
    const clampedTickX = clamp(tickX, tickScale)
    newTickX = isSnappedToHorizontalGrid.value
      ? snapToGrid(clampedTickX, {
          gridSize: factualDisplayedGridWidth,
          threshold: tickThreshold,
        })
      : clampedTickX
  }
  return newTickX
}

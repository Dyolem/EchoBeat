import { defineStore } from "pinia"
import { EDITOR_TYPE_ID_MAP } from "@/constants/daw/index.js"

export const useZoomRatioStore = defineStore("zoomRatio", () => {
  const zoomRatioMap = new Map()
  function initZoomRatioMap(editorTypeIdMap = EDITOR_TYPE_ID_MAP) {
    zoomRatioMap.clear()
    for (const editorTypeKey of Object.keys(editorTypeIdMap)) {
      zoomRatioMap.set(editorTypeIdMap[editorTypeKey], 1)
    }
  }
  function updateSpecifiedEditorZoomRatio(editorId, _newZoomRatio) {
    let newZoomRatio = undefined
    let oldZoomRatio = undefined
    if (zoomRatioMap.has(editorId)) {
      newZoomRatio = _newZoomRatio
      oldZoomRatio = zoomRatioMap.get(editorId)
      zoomRatioMap.set(editorId, newZoomRatio)
    }
    return [newZoomRatio, oldZoomRatio]
  }
  function convertDataBetweenEditors({
    fromValue,
    fromZoomRatio,
    toZoomRatio,
  }) {
    if (
      typeof fromValue !== "number" ||
      typeof fromZoomRatio !== "number" ||
      typeof toZoomRatio !== "number"
    ) {
      throw new TypeError("params type error")
    }
    if (fromZoomRatio === 0) {
      throw new RangeError("Forbid the divisor to be 0")
    }
    return (fromValue / fromZoomRatio) * toZoomRatio
  }

  function getSpecifiedEditorZoomRatio(editorId) {
    return zoomRatioMap.get(editorId)
  }
  return {
    initZoomRatioMap,
    getSpecifiedEditorZoomRatio,
    updateSpecifiedEditorZoomRatio,
    convertDataBetweenEditors,
  }
})

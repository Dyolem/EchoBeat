import { defineStore } from "pinia"
import {
  EDITOR_TYPE_ID_MAP,
  MAIN_EDITOR_ID,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { clamp } from "@/utils/clamp.js"
import { snapToGrid } from "@/utils/alignToGrid.js"
import { ref } from "vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useZoomRatioStore = defineStore("zoomRatio", () => {
  const zoomRatioMap = ref(new Map())
  function initZoomRatioMap(editorTypeIdMap = EDITOR_TYPE_ID_MAP) {
    zoomRatioMap.value.clear()
    for (const editorTypeKey of Object.keys(editorTypeIdMap)) {
      zoomRatioMap.value.set(editorTypeIdMap[editorTypeKey], 1)
    }
  }
  function updateSpecifiedEditorZoomRatio(editorId, _newZoomRatio) {
    let newZoomRatio = undefined
    let oldZoomRatio = undefined
    if (zoomRatioMap.value.has(editorId)) {
      newZoomRatio = _newZoomRatio
      oldZoomRatio = zoomRatioMap.value.get(editorId)
      zoomRatioMap.value.set(editorId, newZoomRatio)
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
    return Number(((fromValue / fromZoomRatio) * toZoomRatio).toFixed(4))
  }

  function createConvert(id) {
    return function convert({ x, editorId, scale }) {
      const beatControllerStore = useBeatControllerStore()
      const defaultEditorId = id
      const isActive = defaultEditorId === editorId
      if (editorId !== MAIN_EDITOR_ID && editorId !== SUBORDINATE_EDITOR_ID) {
        return
      }
      let [minEdgeX, maxEdgeX] = scale
      let gridSize =
        beatControllerStore.factualDisplayedGridWidth(defaultEditorId)
      let threshold = 5
      const convertData = (value) => {
        return convertDataBetweenEditors({
          fromValue: value,
          fromZoomRatio: getSpecifiedEditorZoomRatio(editorId),
          toZoomRatio: getSpecifiedEditorZoomRatio(defaultEditorId),
        })
      }
      if (!isActive) {
        x = convertData(x)
        minEdgeX = convertData(minEdgeX)
        maxEdgeX = convertData(maxEdgeX)
        threshold = convertData(threshold)
      }
      x = clamp(x, [minEdgeX, maxEdgeX])
      x = snapToGrid(x, {
        gridSize,
        threshold,
      })
      return {
        convertedX: x,
        convertedScale: { min: minEdgeX, max: maxEdgeX },
      }
    }
  }

  function getSpecifiedEditorZoomRatio(editorId) {
    return zoomRatioMap.value.get(editorId)
  }
  return {
    initZoomRatioMap,
    getSpecifiedEditorZoomRatio,
    updateSpecifiedEditorZoomRatio,
    convertDataBetweenEditors,
    createConvert,
  }
})

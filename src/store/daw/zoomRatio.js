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
  function convertDataBetweenEditors({ fromValue, fromEditorId, toEditorId }) {
    if (
      !(
        fromValue === undefined &&
        zoomRatioMap.has(fromEditorId) &&
        zoomRatioMap.has(toEditorId)
      )
    )
      return
    return (
      (fromValue / zoomRatioMap.get(fromEditorId)) *
      zoomRatioMap.get(toEditorId)
    )
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

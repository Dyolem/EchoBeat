import { defineStore } from "pinia"
import { EDITOR_TYPE_ID_MAP } from "@/constants/daw/index.js"
import { ref } from "vue"

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

  function getSpecifiedEditorZoomRatio(editorId) {
    return zoomRatioMap.value.get(editorId)
  }
  return {
    initZoomRatioMap,
    getSpecifiedEditorZoomRatio,
    updateSpecifiedEditorZoomRatio,
  }
})

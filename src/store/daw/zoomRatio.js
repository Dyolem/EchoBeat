import { defineStore } from "pinia"
import {
  EDITOR_MODE_ENUM,
  EDITOR_TYPE_ID_MAP,
  MAX_ZOOM,
  MIN_ZOOM,
} from "@/constants/daw/index.js"
import { computed, ref } from "vue"
import { clamp } from "@/utils/clamp.js"
import { dispatchRenderWaveDiagramEvent } from "@/core/custom-event/rerenderWaveDiagram.js"

export const useZoomRatioStore = defineStore("zoomRatio", () => {
  const isSnappedToHorizontalGrid = ref(true)
  const editorMode = ref(EDITOR_MODE_ENUM.SELECT)
  const isInsertMode = computed(
    () => editorMode.value === EDITOR_MODE_ENUM.INSERT,
  )
  const isSelectMode = computed(
    () => editorMode.value === EDITOR_MODE_ENUM.SELECT,
  )
  const isVelocityMode = computed(
    () => editorMode.value === EDITOR_MODE_ENUM.VELOCITY,
  )

  function updateEditMode(mode) {
    if (!Object.values(EDITOR_MODE_ENUM).includes(mode)) return
    editorMode.value = mode
  }

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
      newZoomRatio = clamp(_newZoomRatio, [MIN_ZOOM, MAX_ZOOM])
      oldZoomRatio = zoomRatioMap.value.get(editorId)
      zoomRatioMap.value.set(editorId, newZoomRatio)
    }
    dispatchRenderWaveDiagramEvent([newZoomRatio, oldZoomRatio])
    return [newZoomRatio, oldZoomRatio]
  }

  const currentEditorZoomRatio = computed(() => {
    return (editorId) => zoomRatioMap.value.get(editorId)
  })
  function getSpecifiedEditorZoomRatio(editorId) {
    return zoomRatioMap.value.get(editorId)
  }
  return {
    editorMode,
    isInsertMode,
    isSelectMode,
    isVelocityMode,
    isSnappedToHorizontalGrid,
    currentEditorZoomRatio,
    updateEditMode,
    initZoomRatioMap,
    getSpecifiedEditorZoomRatio,
    updateSpecifiedEditorZoomRatio,
  }
})

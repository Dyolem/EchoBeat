import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  NOTE_ELEMENT_SIZE,
  DEFAULT_ZOOM_RATIO,
  BEAT_GRID_RATIO,
  BASE_GRID_WIDTH,
  BEATS_COUNT,
} from "@/constants/daw/index.js"

export const useEditorGridParametersStore = defineStore(
  "editorGridParameters",
  () => {
    const trackZoomRatio = ref(DEFAULT_ZOOM_RATIO)
    const { baseWidth, baseHeight } = NOTE_ELEMENT_SIZE
    const minGridHorizontalMovement = ref(baseWidth)
    const minGridVerticalMovement = ref(baseHeight)
    const editorWidth = ref(0)
    const editorHeight = ref(0)

    const beatsCount = ref(BEATS_COUNT)
    const widthPerBeat = computed(() => {
      return trackZoomRatio.value * BEAT_GRID_RATIO * BASE_GRID_WIDTH
    })
    const thresholdRatio = ref(2)
    const createNewWorkspaceThreshold = computed(() => {
      return widthPerBeat.value * thresholdRatio.value
    })
    const maxEditorWidth = computed(() => {
      return widthPerBeat.value * beatsCount.value
    })
    function shouldCreateNewWorkspace(oldWorkspaceStartPosition, x) {
      return (
        x >= oldWorkspaceStartPosition + createNewWorkspaceThreshold.value * 3
      )
    }
    return {
      editorWidth,
      trackZoomRatio,
      minGridHorizontalMovement,
      minGridVerticalMovement,
      widthPerBeat,
      createNewWorkspaceThreshold,
      thresholdRatio,
      maxEditorWidth,
      shouldCreateNewWorkspace,
    }
  },
)

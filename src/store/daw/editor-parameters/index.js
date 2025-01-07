import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  NOTE_ELEMENT_SIZE,
  DEFAULT_ZOOM_RATIO,
  BEAT_GRID_RATIO,
  BASE_GRID_WIDTH,
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

    const widthPerBeat = computed(() => {
      return trackZoomRatio.value * BEAT_GRID_RATIO * BASE_GRID_WIDTH
    })
    const createNewWorkspaceThreshold = computed(() => {
      return widthPerBeat.value * 2
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
      shouldCreateNewWorkspace,
    }
  },
)

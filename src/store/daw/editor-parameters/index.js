import { defineStore } from "pinia"
import { ref } from "vue"
import { NOTE_ELEMENT_SIZE, DEFAULT_ZOOM_RATIO } from "@/constants/daw/index.js"

export const useEditorGridParametersStore = defineStore(
  "editorGridParameters",
  () => {
    const trackZoomRatio = ref(DEFAULT_ZOOM_RATIO)
    const { baseWidth, baseHeight } = NOTE_ELEMENT_SIZE
    const minGridHorizontalMovement = ref(baseWidth)
    const minGridVerticalMovement = ref(baseHeight)
    const editorWidth = ref(0)
    const editorHeight = ref(0)

    return {
      editorWidth,
      trackZoomRatio,
      minGridHorizontalMovement,
      minGridVerticalMovement,
    }
  },
)

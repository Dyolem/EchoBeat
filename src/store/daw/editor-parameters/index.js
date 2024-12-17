import { defineStore } from "pinia"
import { ref, watchEffect } from "vue"

export const useEditorGridParametersStore = defineStore(
  "editorGridParameters",
  () => {
    const trackZoomRatio = ref(1)
    const minGridHorizontalMovement = ref(20)
    const minGridVerticalMovement = ref(9.3)

    return {
      trackZoomRatio,
      minGridHorizontalMovement,
      minGridVerticalMovement,
    }
  },
)

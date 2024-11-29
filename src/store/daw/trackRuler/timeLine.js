import { defineStore } from "pinia"
import { ref } from "vue"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const timeLineTranslateDistance = ref(0)

  return {
    timeLineTranslateDistance,
  }
})

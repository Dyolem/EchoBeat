import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const timelineCurrentTime = ref(0)
  const beatControllerStore = useBeatControllerStore()
  const maxTime = computed(() => {
    return beatControllerStore.editableTotalTime
  })
  function updateCurrentTime(newTime) {
    timelineCurrentTime.value = newTime
  }

  return {
    timelineCurrentTime,
    maxTime,
    updateCurrentTime,
  }
})

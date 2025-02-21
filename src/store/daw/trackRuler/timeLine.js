import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const isPlaying = ref(false)
  const timelineCurrentTime = ref(0)
  const beatControllerStore = useBeatControllerStore()
  const maxTime = computed(() => {
    return beatControllerStore.editableTotalTime
  })
  function updateCurrentTime(newTime) {
    timelineCurrentTime.value = newTime
  }
  const isDraggingTimelineByUser = ref(false)
  return {
    isPlaying,
    isDraggingTimelineByUser,
    timelineCurrentTime,
    maxTime,
    updateCurrentTime,
  }
})

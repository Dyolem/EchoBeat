import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { clamp } from "@/utils/clamp.js"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const isPlaying = ref(false)
  const timelineCurrentTime = ref(0)
  const beatControllerStore = useBeatControllerStore()
  const maxTime = computed(() => {
    return beatControllerStore.editableTotalTime
  })
  function updateCurrentTime(newTime) {
    timelineCurrentTime.value = clamp(newTime, [0, maxTime.value])
  }
  const isDraggingTimelineByUser = ref(false)
  function updateTimelineDraggingState(newState) {
    isDraggingTimelineByUser.value = newState
  }
  function changePlayState(state) {
    if (typeof state !== "boolean") return
    isPlaying.value = state
  }
  return {
    isPlaying,
    isDraggingTimelineByUser,
    timelineCurrentTime,
    maxTime,
    updateCurrentTime,
    updateTimelineDraggingState,
    changePlayState,
  }
})

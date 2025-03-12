import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useTrackRulerStore = defineStore("dawTrackRulerTimeLine", () => {
  const isPlaying = ref(false)
  const timelineCurrentTime = ref(0)
  const logicTimeOffset = ref(0)
  const beatControllerStore = useBeatControllerStore()
  const maxTime = computed(() => {
    return beatControllerStore.editableTotalTime
  })
  function updateCurrentTime(newTime) {
    timelineCurrentTime.value = newTime
  }
  const isDraggingTimelineByUser = ref(false)
  function updateTimelineDraggingState(newState) {
    isDraggingTimelineByUser.value = newState
  }
  function changePlayState(state) {
    if (typeof state !== "boolean") return
    isPlaying.value = state
  }
  function updateLogicTimeOffset(offsetIncrementVal) {
    if (typeof offsetIncrementVal !== "number") return
    logicTimeOffset.value += offsetIncrementVal
  }
  return {
    isPlaying,
    logicTimeOffset,
    isDraggingTimelineByUser,
    timelineCurrentTime,
    maxTime,
    updateCurrentTime,
    updateTimelineDraggingState,
    changePlayState,
    updateLogicTimeOffset,
  }
})

import { defineStore } from "pinia"
import { ref } from "vue"
import { BASE_GRID_HEIGHT } from "@/constants/daw/index.js"

export const useMixTrackEditorStore = defineStore("mixTrackEditorStore", () => {
  const baseTrackHeight = BASE_GRID_HEIGHT
  const mixTrackUnitMap = ref(
    new Map([
      [
        "1",
        {
          trackWidth: 100,
          trackHeight: baseTrackHeight,
        },
      ],
      [
        "2",
        {
          trackWidth: 100,
          trackHeight: baseTrackHeight,
        },
      ],
    ]),
  )
  return { mixTrackUnitMap }
})

import { defineStore } from "pinia"
import { ref } from "vue"
import { BASE_GRID_HEIGHT } from "@/constants/daw/index.js"
import { generateUniqueId } from "@/utils/generateUniqueId.js"
import { useAudioTrackMainColorStore } from "@/store/daw/audio-track-color/index.js"

export const useMixTrackEditorStore = defineStore("mixTrackEditorStore", () => {
  const audioTrackMainColorStore = useAudioTrackMainColorStore()
  const baseTrackHeight = BASE_GRID_HEIGHT
  const mixTrackUnitMap = ref(
    new Map([
      [
        "1",
        {
          id: "1",
          audioTrackName: "Instrument",
          trackWidth: 100,
          trackHeight: baseTrackHeight,
          mainColor: "#000000",
          serialNumbering: 1,
        },
      ],
      [
        "2",
        {
          id: "2",
          audioTrackName: "Base",
          trackWidth: 100,
          trackHeight: baseTrackHeight,
          mainColor: "#0069c2",
          serialNumbering: 1,
        },
      ],
    ]),
  )
  function getBaseInfoTemplate() {
    return {
      trackWidth: 100,
      trackHeight: baseTrackHeight,
    }
  }
  function addAudioTrack({
    audioTrackName,
    mainColor = audioTrackMainColorStore.getRandomColor(),
  }) {
    const newTrackId = generateUniqueId("AudioTrack")
    const existedTracksSize = mixTrackUnitMap.value.size
    mixTrackUnitMap.value.set(newTrackId, {
      ...getBaseInfoTemplate(),
      id: newTrackId,
      audioTrackName,
      mainColor,
      serialNumbering: existedTracksSize + 1,
    })
  }
  return { mixTrackUnitMap, addAudioTrack }
})

import { defineStore } from "pinia"
import { ref } from "vue"
import { BASE_GRID_HEIGHT } from "@/constants/daw/index.js"
import { generateUniqueId } from "@/utils/generateUniqueId.js"
import { useAudioTrackMainColorStore } from "@/store/daw/audio-track-color/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"

export const useMixTrackEditorStore = defineStore("mixTrackEditorStore", () => {
  const audioTrackMainColorStore = useAudioTrackMainColorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const workspaceStore = useWorkspaceStore()
  const baseTrackHeight = BASE_GRID_HEIGHT
  /**
   * @typedef {string} AudioTrackId - 音轨唯一标识符
   */

  /**
   * @typedef {Object} MixTrackUnit
   * @property {AudioTrackId} id - 音轨的唯一标识符
   * @property {string} audioTrackName - 音轨显示名称
   * @property {number} trackWidth - 音轨宽度（单位：像素）
   * @property {number} trackHeight - 音轨高度（单位：像素）
   * @property {string} mainColor - 音轨主色（十六进制颜色代码）
   * @property {number} serialNumbering - 音轨序号
   * @property {number} startPosition - 音轨起始位置（单位：像素）
   */

  /**
   * @type {import('vue').Ref<Map<AudioTrackId, MixTrackUnit>>}
   */
  const mixTrackUnitMap = ref(new Map([]))
  function getBaseInfoTemplate() {
    return {
      trackWidth: 0,
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
    trackFeatureMapStore.addTrackFeatureMap(newTrackId, {
      midiWorkspace: workspaceStore.createNewWorkspaceMap(),
    })
    return newTrackId
  }

  function audioTrackUpdatedWithWorkspace({
    audioTrackId,
    trackWidth: newTrackWidth,
    trackStartPosition: newTrackStartPosition,
  }) {
    const audioTrack = mixTrackUnitMap.value.get(audioTrackId)
    if (!audioTrack) return
    if (newTrackWidth !== undefined) audioTrack.trackWidth = newTrackWidth

    if (newTrackStartPosition !== undefined)
      audioTrack.startPosition = newTrackStartPosition
  }
  return {
    mixTrackUnitMap,
    addAudioTrack,
    audioTrackUpdatedWithWorkspace,
  }
})

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
  const mixTracksMap = ref(new Map([]))
  function getBaseInfoTemplate() {
    return {
      trackWidth: 0,
      trackHeight: baseTrackHeight,
    }
  }
  function createNewTrack({
    audioTrackName,
    mainColor = audioTrackMainColorStore.getRandomColor(),
  }) {
    const newTrackId = generateUniqueId("AudioTrack")
    const existedTracksSize = mixTracksMap.value.size
    mixTracksMap.value.set(newTrackId, {
      id: newTrackId,
      audioTrackName,
      mainColor,
      serialNumbering: existedTracksSize + 1,
      subTrackItemsMap: new Map(),
    })
    return newTrackId
  }
  function createSubTrackItem({
    audioTrackId,
    trackWidth,
    trackHeight,
    startPosition,
  }) {
    const subTrackItemMap = mixTracksMap.value.get(audioTrackId).subTrackItemMap
    const subTrackItemId = generateUniqueId(audioTrackId)
    subTrackItemMap.set(subTrackItemId, {
      trackWidth,
      trackHeight,
      startPosition,
      audioTrackId,
      subTrackItemId,
    })
    return subTrackItemId
  }
  function addAudioTrack({
    audioTrackName,
    mainColor = audioTrackMainColorStore.getRandomColor(),
    midiWorkspaceZoomRatio,
  }) {
    const newTrackId = createNewTrack({ audioTrackName, mainColor })
    trackFeatureMapStore.addTrackFeatureMap(newTrackId, {
      midiWorkspace: {
        workspaceMap: workspaceStore.createNewWorkspaceMap(),
        zoomRatio: midiWorkspaceZoomRatio,
      },
    })
    return newTrackId
  }

  function audioTrackUpdatedWithWorkspace({
    audioTrackId,
    subTrackItemId,
    trackWidth: newTrackWidth,
    trackStartPosition: newTrackStartPosition,
  }) {
    // const subTrackItemMap = mixTracksMap.value.get(audioTrackId).subTrackItemMap
    // const subTrack = subTrackItemMap.get(subTrackItemId)
    // if (!subTrack) return
    // if (newTrackWidth !== undefined) subTrack.trackWidth = newTrackWidth
    //
    // if (newTrackStartPosition !== undefined)
    //   subTrack.startPosition = newTrackStartPosition

    const subTrackItemMap = mixTracksMap.value.get(audioTrackId)
    const subTrack = subTrackItemMap.get(subTrackItemId)
    if (!subTrack) return
    if (newTrackWidth !== undefined) subTrack.trackWidth = newTrackWidth

    if (newTrackStartPosition !== undefined)
      subTrack.startPosition = newTrackStartPosition
  }
  return {
    mixTracksMap,
    addAudioTrack,
    audioTrackUpdatedWithWorkspace,
    createSubTrackItem,
  }
})

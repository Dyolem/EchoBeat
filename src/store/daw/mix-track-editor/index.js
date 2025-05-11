import { defineStore } from "pinia"
import { ref } from "vue"
import {
  AUDIO_TRACK_ENUM,
  BASE_GRID_HEIGHT,
  ID_SET,
} from "@/constants/daw/index.js"
import { useAudioTrackMainColorStore } from "@/store/daw/audio-track-color/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { snapToTickUnitGrid } from "@/core/grid-size/snapToTickUnitGrid.js"
import { registerDeleteAudioTrackEvent } from "@/core/custom-event/deleteAudioTrack.js"
import { registerDeleteSubTrackEvent } from "@/core/custom-event/deleteSubTrack.js"
import { getInitInstrumentInfo } from "@/constants/daw/instruments.js"

export const useMixTrackEditorStore = defineStore("mixTrackEditorStore", () => {
  const audioTrackMainColorStore = useAudioTrackMainColorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const workspaceStore = useWorkspaceStore()
  const beatControllerStore = useBeatControllerStore()

  /**
   * @typedef {import('../type.js').MixTracksMap} MixTracksMap
   * @typedef {import('vue').Ref<MixTracksMap>} mixTracksMap
   */
  const mixTracksMap = ref(new Map([]))
  const activeMixTrackId = ref("")
  const createNewTrackHandlers = {
    [AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS]: () => {
      const defaultProgramNumber = 0
      const channel = 0
      const { customInstrumentType, family, sound, instrumentName } =
        getInitInstrumentInfo({ programNumber: defaultProgramNumber, channel })
      const instrument = {
        number: defaultProgramNumber,
        customInstrumentType,
        channel,
        family,
        name: instrumentName,
        sound,
      }
      return {
        instrument,
        channel,
      }
    },
    [AUDIO_TRACK_ENUM.VOICE]: () => {
      return {}
    },
    [AUDIO_TRACK_ENUM.DRUM_MACHINE]: () => {},
    [AUDIO_TRACK_ENUM.BASS]: () => {},
    [AUDIO_TRACK_ENUM.GUITAR]: () => {},
    [AUDIO_TRACK_ENUM.SAMPLE]: () => {},
  }
  const generateAudioTrackId = (prefix) => ID_SET.AUDIO_TRACK(prefix)
  function createNewTrack({ audioTrackName, audioTrackType, audioTrackIcon }) {
    const mainColor = audioTrackMainColorStore.getRandomColor()
    const newAudioTrackId = generateAudioTrackId()
    const existedTracksSize = mixTracksMap.value.size
    const baseAudioTrackInfo = {
      id: newAudioTrackId,
      audioTrackName,
      audioTrackIcon,
      audioTrackType,
      subTrackItemsMap: new Map(),
      originalSerialNumbering: existedTracksSize,
      mainColor,
    }

    mixTracksMap.value.set(newAudioTrackId, {
      ...baseAudioTrackInfo,
      ...createNewTrackHandlers[audioTrackType](),
    })
    return newAudioTrackId
  }

  function addAudioTrack({ audioTrackName, audioTrackType, audioTrackIcon }) {
    audioTrackName = audioTrackName === "" ? audioTrackType : audioTrackName
    const newTrackId = createNewTrack({
      audioTrackName,
      audioTrackType,
      audioTrackIcon,
    })
    trackFeatureMapStore.addTrackFeatureMap({
      audioTrackId: newTrackId,
      workspaceMap: workspaceStore.createNewWorkspaceMap(),
    })
    return newTrackId
  }

  function updateMixTrackInfo({ audioTrackId, trackName, color }) {
    const mixTrack = mixTracksMap.value.get(audioTrackId)
    if (trackName !== undefined) {
      mixTrack.audioTrackName = trackName
    }
    if (color !== undefined) {
      mixTrack.mainColor = color
    }
  }

  const generateSubTrackItemId = (prefix) => ID_SET.SUB_TRACK_ITEM(prefix)
  function createSubTrackItem({
    audioTrackId,
    workspaceId,
    trackItemWidth,
    trackItemHeight = BASE_GRID_HEIGHT - 18,
    startPosition,
    trackName,
  }) {
    const mixTrack = mixTracksMap.value.get(audioTrackId)
    const subTrackItemsMap = mixTrack.subTrackItemsMap
    const subTrackItemId = generateSubTrackItemId()
    const mainColor = mixTrack.mainColor
    trackName = mixTrack.audioTrackName
    subTrackItemsMap.set(subTrackItemId, {
      audioTrackId,
      workspaceId,
      subTrackItemId,
      trackItemWidth,
      trackItemHeight,
      mainColor,
      startPosition,
      trackName,
    })
    return subTrackItemId
  }

  function getAudioTrackInstrument({ audioTrackId }) {
    return mixTracksMap.value.get(audioTrackId).instrument
  }

  function updateSubTrackItemInfo({
    audioTrackId,
    subTrackItemId,
    subTrackName,
    color,
  }) {
    const subTrackItem = getSubTrackItem({ audioTrackId, subTrackItemId })
    if (subTrackName !== undefined) {
      subTrackItem.trackName = subTrackName
    }
    if (color !== undefined) {
      subTrackItem.mainColor = color
    }
  }

  function getSubTrackItemsMap({ audioTrackId }) {
    return mixTracksMap.value.get(audioTrackId).subTrackItemsMap
  }
  function getSubTrackItem({ audioTrackId, subTrackItemId }) {
    return getSubTrackItemsMap({ audioTrackId }).get(subTrackItemId)
  }

  /**
   * 传入参数中的长度值和函数返回值均为px单位
   * @param {string} editorId - 调用该方法的编辑器id
   * @param {string} audioTrackId - 音轨id
   * @param {string} subTrackItemId - 子轨道id
   * @param {number} x - 相对于编辑器中的垂直边横坐标，不是相对于document的坐标
   * @param {[number,number]} scale - 数值范围
   * @param {number} initLeftEdgeX - 初始左边界的横坐标
   */
  function updateRightEdge({
    editorId,
    audioTrackId,
    subTrackItemId,
    x,
    initLeftEdgeX,
  }) {
    const subTrackItem = getSubTrackItem({
      audioTrackId,
      subTrackItemId,
    })
    const scale = [initLeftEdgeX, beatControllerStore.totalLength(editorId)]
    const newRightEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: x,
      tickScale: scale,
    })

    subTrackItem.trackItemWidth = newRightEdgeX - initLeftEdgeX
    return [newRightEdgeX, x]
  }

  /**
   * 传入参数中的长度值和函数返回值均为px单位
   * @param editorId
   * @param audioTrackId
   * @param subTrackItemId
   * @param x
   * @param initRightEdgeX
   */
  function updateLeftEdge({
    editorId,
    audioTrackId,
    subTrackItemId,
    x,
    initRightEdgeX,
  }) {
    const subTrackItem = getSubTrackItem({
      audioTrackId,
      subTrackItemId,
    })
    const scale = [0, initRightEdgeX]
    const newLeftEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: x,
      tickScale: scale,
    })

    const newTrackItemWidth = initRightEdgeX - newLeftEdgeX
    subTrackItem.startPosition = newLeftEdgeX
    subTrackItem.trackItemWidth = newTrackItemWidth
    return [newLeftEdgeX, x]
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateSubTrackItemStartPosition({
    editorId,
    audioTrackId,
    subTrackItemId,
    startPosition,
    horizontalScale,
  }) {
    const subTrackItem = getSubTrackItem({ audioTrackId, subTrackItemId })
    const newStartPosition = snapToTickUnitGrid({
      editorId,
      tickX: startPosition,
      tickScale: horizontalScale,
    })

    const oldStartPosition = subTrackItem.startPosition
    subTrackItem.startPosition = newStartPosition
    return [newStartPosition, oldStartPosition]
  }

  function deleteSpecifiedSubTrackItem({ audioTrackId, subTrackItemId }) {
    const subTrackItemsMap = getSubTrackItemsMap({ audioTrackId })
    subTrackItemsMap?.delete(subTrackItemId)
  }
  registerDeleteSubTrackEvent(deleteSpecifiedSubTrackItem)

  function deleteSpecifiedAudioTrack({ audioTrackId }) {
    mixTracksMap.value.delete(audioTrackId)
  }
  registerDeleteAudioTrackEvent(deleteSpecifiedAudioTrack)

  function getAudioTrack({ audioTrackId }) {
    return mixTracksMap.value.get(audioTrackId)
  }

  function updateSelectedActiveAudioTrackId(newId) {
    if (newId === undefined || newId === null) return
    activeMixTrackId.value = newId
  }
  return {
    mixTracksMap,
    activeMixTrackId,
    getAudioTrack,
    generateAudioTrackId,
    generateSubTrackItemId,
    addAudioTrack,
    getAudioTrackInstrument,
    updateMixTrackInfo,
    getSubTrackItem,
    getSubTrackItemsMap,
    createSubTrackItem,
    updateSubTrackItemInfo,
    updateLeftEdge,
    updateRightEdge,
    updateSubTrackItemStartPosition,
    deleteSpecifiedSubTrackItem,
    deleteSpecifiedAudioTrack,
    updateSelectedActiveAudioTrackId,
  }
})

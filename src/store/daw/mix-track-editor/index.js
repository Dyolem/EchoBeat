import { defineStore } from "pinia"
import { ref } from "vue"
import {
  BASE_GRID_HEIGHT,
  ID_SET,
  MAIN_EDITOR_ID,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useAudioTrackMainColorStore } from "@/store/daw/audio-track-color/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { clamp } from "@/utils/clamp.js"

export const useMixTrackEditorStore = defineStore("mixTrackEditorStore", () => {
  const audioTrackMainColorStore = useAudioTrackMainColorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const workspaceStore = useWorkspaceStore()
  const baseTrackHeight = BASE_GRID_HEIGHT
  const zoomRatioStore = useZoomRatioStore()

  /**
   * @typedef {import('../type.js').MixTracksMap} MixTracksMap
   * @typedef {import('vue').Ref<MixTracksMap>} mixTracksMap
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
    mainEditorZoomRatio = 1,
  }) {
    const newAudioTrackId = ID_SET.AUDIO_TRACK()
    const existedTracksSize = mixTracksMap.value.size
    mixTracksMap.value.set(newAudioTrackId, {
      id: newAudioTrackId,
      audioTrackName,
      mainColor,
      serialNumbering: existedTracksSize + 1,
      subTrackItemsMap: new Map(),
      mainEditorZoomRatio,
    })
    return newAudioTrackId
  }

  const generateSubTrackItemId = (prefix) => ID_SET.SUB_TRACK_ITEM(prefix)
  function createSubTrackItem({
    audioTrackId,
    workspaceId,
    trackItemWidth,
    trackItemHeight = BASE_GRID_HEIGHT,
    startPosition,
    trackName,
  }) {
    const mixTrack = mixTracksMap.value.get(audioTrackId)
    const subTrackItemsMap = mixTrack.subTrackItemsMap
    const subTrackItemId = generateSubTrackItemId()
    const mainColor = mixTrack.mainColor
    const trackZoomRatio = mixTrack.mainEditorZoomRatio
    subTrackItemsMap.set(subTrackItemId, {
      audioTrackId,
      workspaceId,
      subTrackItemId,
      trackItemWidth,
      trackItemHeight,
      mainColor,
      startPosition,
      trackName,
      trackZoomRatio,
    })
    return subTrackItemId
  }
  function addAudioTrack({
    audioTrackName,
    mainColor = audioTrackMainColorStore.getRandomColor(),
    mainEditorZoomRatio,
    midiWorkspaceZoomRatio,
  }) {
    const newTrackId = createNewTrack({
      audioTrackName,
      mainColor,
      mainEditorZoomRatio,
    })
    trackFeatureMapStore.addTrackFeatureMap(newTrackId, {
      midiWorkspace: {
        workspaceBadgeName: audioTrackName,
        workspaceMap: workspaceStore.createNewWorkspaceMap(),
        zoomRatio: midiWorkspaceZoomRatio,
      },
    })
    return newTrackId
  }

  const convertDataFromSubToMain = (value) => {
    return zoomRatioStore.convertDataBetweenEditors({
      fromValue: value,
      fromZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(
        SUBORDINATE_EDITOR_ID,
      ),
      toZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(MAIN_EDITOR_ID),
    })
  }
  function getSubTrackItemsMap({ audioTrackId }) {
    return mixTracksMap.value.get(audioTrackId).subTrackItemsMap
  }
  function getSubTrackItem({ audioTrackId, subTrackItemId }) {
    return getSubTrackItemsMap({ audioTrackId }).get(subTrackItemId)
  }
  function updateSubTrackItemWidth({
    audioTrackId,
    subTrackItemId,
    width,
    scale,
    isActive = true,
  }) {
    const subTrackItem = getSubTrackItem({ audioTrackId, subTrackItemId })
    const oldWidth = subTrackItem.trackItemWidth
    const newWidth = isActive
      ? width
      : convertDataFromSubToMain(clamp(width, scale))
    subTrackItem.trackItemWidth = newWidth
    return [newWidth, oldWidth]
  }

  function updateSubTrackItemStartPosition({
    audioTrackId,
    subTrackItemId,
    startPosition,
    horizontalScale,
    isActive = true,
  }) {
    startPosition = clamp(startPosition, horizontalScale)
    const subTrackItem = getSubTrackItem({ audioTrackId, subTrackItemId })
    const oldStartPosition = subTrackItem.startPosition
    const newStartPosition = isActive
      ? startPosition
      : convertDataFromSubToMain(startPosition)
    subTrackItem.startPosition = newStartPosition
    return [newStartPosition, oldStartPosition]
  }

  function passivePatchUpdateAudioTracksWithZoomRatio({
    newZoomRatio,
    oldZoomRatio,
  }) {
    if (
      newZoomRatio === oldZoomRatio ||
      newZoomRatio === undefined ||
      oldZoomRatio === undefined
    )
      return

    for (const audioTrack of mixTracksMap.value.values()) {
      for (const subTrackItem of audioTrack.subTrackItemsMap.values()) {
        subTrackItem.trackItemWidth *= newZoomRatio / oldZoomRatio
        subTrackItem.startPosition =
          (subTrackItem.startPosition / oldZoomRatio) * newZoomRatio
        subTrackItem.trackZoomRatio = newZoomRatio
      }
    }
  }

  function deleteSpecifiedSubTrackItem({ audioTrackId, subTrackItemId }) {
    const subTrackItemsMap = getSubTrackItemsMap({ audioTrackId })
    subTrackItemsMap?.delete(subTrackItemId)
  }

  return {
    mixTracksMap,
    generateSubTrackItemId,
    addAudioTrack,
    getSubTrackItem,
    getSubTrackItemsMap,
    createSubTrackItem,
    updateSubTrackItemWidth,
    updateSubTrackItemStartPosition,
    passivePatchUpdateAudioTracksWithZoomRatio,
    deleteSpecifiedSubTrackItem,
  }
})

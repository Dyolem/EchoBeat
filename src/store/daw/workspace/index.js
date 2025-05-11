import { defineStore } from "pinia"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { alignToGrid } from "@/utils/alignToGrid.js"
import {
  ALIGN_TYPE_ENUM,
  AUDIO_TRACK_ENUM,
  ID_SET,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { computed } from "vue"
import { snapToTickUnitGrid } from "@/core/grid-size/snapToTickUnitGrid.js"
import { registerDeleteSubTrackEvent } from "@/core/custom-event/deleteSubTrack.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const mixTrackEditorStore = useMixTrackEditorStore()
  const noteItemStore = useNoteItemStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const beatControllerStore = useBeatControllerStore()
  const widthPerMeasure = computed(() => {
    return beatControllerStore.widthPerMeasure(SUBORDINATE_EDITOR_ID)
  })
  const factualDisplayedGridWidth = computed(() => {
    return beatControllerStore.factualDisplayedGridWidth(SUBORDINATE_EDITOR_ID)
  })
  const maxEditorWidth = computed(() => {
    return beatControllerStore.totalLength(SUBORDINATE_EDITOR_ID)
  })

  const generateWorkspaceId = (prefix) => ID_SET.WORKSPACE(prefix)
  const generateAudioFileClipId = (prefix) =>
    ID_SET.AUDIO_BUFFER_FILE_ID(prefix)

  /**
   * 传入参数与返回值均为tick单位
   * @param {number} createPosition
   * @param {number} rightWorkspace
   * @param {number} maxNewWorkspaceWidth
   * @returns {{isCreateNewWorkspace: boolean, workspaceInfo: {id: string, startPosition: (*|{x, y}), width: number}}}
   */
  function createNewWorkspaceAtLeftSide({
    createPosition,
    rightWorkspace,
    maxNewWorkspaceWidth,
  }) {
    const minGridHorizontalMovement = factualDisplayedGridWidth.value
    let startPosition = 0
    let width = 0
    if (maxNewWorkspaceWidth >= widthPerMeasure.value) {
      width = widthPerMeasure.value
      startPosition = Math.min(
        createPosition,
        rightWorkspace.startPosition - widthPerMeasure.value,
      )
    } else {
      width = maxNewWorkspaceWidth
      startPosition = rightWorkspace.startPosition - width
    }

    return {
      isCreateNewWorkspace: true,
      workspaceInfo: {
        id: generateWorkspaceId(),
        startPosition: alignToGrid(startPosition, {
          gridSize: minGridHorizontalMovement,
          alignType: ALIGN_TYPE_ENUM.LEFT_JUSTIFYING,
        }),
        width,
      },
    }
  }

  /**
   * 传入参数与返回值均为tick单位
   * @param {number} createPosition
   * @param {number} leftWorkspace
   * @param {number} maxStretchableSpace
   * @returns {{isCreateNewWorkspace: boolean, workspaceInfo: {id, width: number, startPosition: number}}}
   */
  function stretchWorkspaceAtRightSide({
    createPosition,
    leftWorkspace,
    maxStretchableSpace,
  }) {
    const createNewWorkspaceThreshold = widthPerMeasure.value * 2
    let stretchIncrement = 0
    if (
      createPosition - (leftWorkspace.startPosition + leftWorkspace.width) >
      widthPerMeasure.value
    ) {
      stretchIncrement = Math.min(
        createNewWorkspaceThreshold,
        maxStretchableSpace,
      )
    } else {
      stretchIncrement = Math.min(widthPerMeasure.value, maxStretchableSpace)
    }
    const newWidth = leftWorkspace.width + stretchIncrement
    return {
      isCreateNewWorkspace: false,
      workspaceInfo: {
        id: leftWorkspace.id,
        width: newWidth,
        startPosition: leftWorkspace.startPosition,
      },
    }
  }

  /**
   * createPosition参数为tick单位，返回值均为tick单位
   * @param {number} createPosition
   * @param workspaceMap
   */
  function computedStartPosition(createPosition, workspaceMap) {
    // if(!workspaceMap) return
    const createNewWorkspaceThreshold = widthPerMeasure.value * 2
    const xTickUnit = createPosition
    const sortedWorkspaceArr = Array.from(workspaceMap.values()).sort(
      (a, b) => {
        return a.startPosition - b.startPosition
      },
    )
    if (sortedWorkspaceArr.length === 0) {
      return createNewWorkspaceAtLeftSide({
        createPosition: xTickUnit,
        rightWorkspace: {
          startPosition: maxEditorWidth.value,
        },
        maxNewWorkspaceWidth: maxEditorWidth.value,
      })
    }
    for (const workspace of sortedWorkspaceArr) {
      if (
        xTickUnit >= workspace.startPosition &&
        xTickUnit < workspace.startPosition + workspace.width
      ) {
        return {
          isCreateNewWorkspace: false,
          workspaceInfo: {
            id: workspace.id,
            width: workspace.width,
            startPosition: workspace.startPosition,
          },
        }
      }
    }

    const index = sortedWorkspaceArr.findIndex((workspace) => {
      return workspace.startPosition > xTickUnit
    })
    if (index >= 1) {
      const leftWorkspace = sortedWorkspaceArr[index - 1]
      const rightWorkspace = sortedWorkspaceArr[index]
      const restSpace =
        rightWorkspace.startPosition -
        (leftWorkspace.startPosition + leftWorkspace.width)
      if (
        xTickUnit - (leftWorkspace.startPosition + leftWorkspace.width) <=
        createNewWorkspaceThreshold
      ) {
        return stretchWorkspaceAtRightSide({
          createPosition: xTickUnit,
          leftWorkspace,
          maxStretchableSpace: restSpace,
        })
      } else {
        return createNewWorkspaceAtLeftSide({
          createPosition: xTickUnit,
          rightWorkspace,
          maxNewWorkspaceWidth: restSpace,
        })
      }
    } else if (index === 0) {
      const rightWorkspace = sortedWorkspaceArr[index]
      const restSpace = rightWorkspace.startPosition
      return createNewWorkspaceAtLeftSide({
        createPosition: xTickUnit,
        rightWorkspace,
        maxNewWorkspaceWidth: restSpace,
      })
    } else if (index === -1) {
      const leftWorkspace = sortedWorkspaceArr[sortedWorkspaceArr.length - 1]
      const restSpace =
        maxEditorWidth.value -
        (leftWorkspace.startPosition + leftWorkspace.width)
      if (
        xTickUnit - (leftWorkspace.startPosition + leftWorkspace.width) <=
        createNewWorkspaceThreshold
      ) {
        return stretchWorkspaceAtRightSide({
          createPosition: xTickUnit,
          leftWorkspace,
          maxStretchableSpace: restSpace,
        })
      } else {
        const rightWorkspace = {
          startPosition: maxEditorWidth.value,
        }
        return createNewWorkspaceAtLeftSide({
          createPosition: xTickUnit,
          rightWorkspace,
          maxNewWorkspaceWidth: restSpace,
        })
      }
    }
  }

  /**
   * startPosition参数为tick单位，返回值中的长度值均为tick单位
   * @param audioTrackId
   * @param startPosition
   */
  function shallCreateWorkspace({ audioTrackId, startPosition }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId,
    })
    const { audioTrackName } = mixTrackEditorStore.getAudioTrack({
      audioTrackId,
    })
    const { isCreateNewWorkspace, workspaceInfo } = computedStartPosition(
      startPosition,
      workspaceMap,
    )
    if (isCreateNewWorkspace) {
      const noteItemsMap = noteItemStore.createNoteItemsMap()
      const { startPosition, width, id: newId } = workspaceInfo

      const workspaceContent = {
        id: newId,
        audioTrackId,
        workspaceBadgeName: audioTrackName,
        noteItemsMap: noteItemsMap,
        width,
        startPosition,
        subTrackItemId: "",
      }
      workspaceMap.set(newId, workspaceContent)
      return {
        isCreated: isCreateNewWorkspace,
        workspace: workspaceContent,
      }
    } else {
      const { startPosition, width, id: modifiedWorkspaceId } = workspaceInfo
      const workspace = workspaceMap.get(modifiedWorkspaceId)
      workspace.width = width
      return {
        isCreated: isCreateNewWorkspace,
        workspace: {
          id: modifiedWorkspaceId,
          audioTrackId,
          startPosition,
          width,
          noteItemsMap: workspace.noteItemsMap,
          workspaceBadgeName: audioTrackName,
          subTrackItemId: workspace.subTrackItemId,
        },
      }
    }
  }
  function createNewWorkspaceMap() {
    return new Map()
  }

  const addNewWorkspaceHandlers = {
    [AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS]: () => {
      const newId = generateWorkspaceId()
      const noteItemsMap = noteItemStore.createNoteItemsMap()
      return { id: newId, noteItemsMap }
    },
    [AUDIO_TRACK_ENUM.VOICE]: () => {
      const newId = generateAudioFileClipId()
      return { id: newId }
    },
    [AUDIO_TRACK_ENUM.DRUM_MACHINE]: () => {},
    [AUDIO_TRACK_ENUM.BASS]: () => {},
    [AUDIO_TRACK_ENUM.GUITAR]: () => {},
    [AUDIO_TRACK_ENUM.SAMPLE]: () => {},
  }
  function addNewWorkspace({
    audioTrackId,
    audioTrackType,
    width,
    startPosition,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId,
    })
    const audioTrack = mixTrackEditorStore.getAudioTrack({ audioTrackId })
    const workspaceBadgeName = audioTrack.audioTrackName
    const baseWorkspaceProperty = {
      audioTrackId,
      audioTrackType,
      workspaceBadgeName,
      width,
      startPosition,
      subTrackItemId: "",
    }
    const specialProperties = addNewWorkspaceHandlers[audioTrackType]()
    const workspaceContent = {
      ...baseWorkspaceProperty,
      ...specialProperties,
    }
    const newId = specialProperties.id
    workspaceMap.set(newId, workspaceContent)
    return newId
  }

  function updateWorkspaceInfo({ audioTrackId, workspaceId, workspaceName }) {
    if (workspaceName !== undefined) {
      const workspace = getWorkspace({ audioTrackId, workspaceId })
      workspace.workspaceBadgeName = workspaceName
    }
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateWorkspacePosition({
    editorId,
    workspaceId,
    selectedAudioTrackId,
    startPosition,
    positionScale,
  }) {
    const workspace = getWorkspace({
      audioTrackId: selectedAudioTrackId,
      workspaceId,
    })
    const newStartPosition = snapToTickUnitGrid({
      editorId,
      tickX: startPosition,
      tickScale: positionScale,
    })
    const oldStartPosition = workspace.startPosition
    workspace.startPosition = newStartPosition
    return [newStartPosition, oldStartPosition]
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateRightEdge({
    editorId,
    audioTrackId,
    workspaceId,
    x,
    initLeftEdgeX,
  }) {
    const workspace = getWorkspace({
      audioTrackId,
      workspaceId,
    })
    const scale = [initLeftEdgeX, beatControllerStore.totalLength(editorId)]
    const newRightEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: x,
      tickScale: scale,
    })
    workspace.width = newRightEdgeX - initLeftEdgeX
    return [newRightEdgeX, x]
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   * @param editorId
   * @param audioTrackId
   * @param workspaceId
   * @param x
   * @param initRightEdgeX
   */
  function updateLeftEdge({
    editorId,
    audioTrackId,
    workspaceId,
    x,
    initRightEdgeX,
  }) {
    const workspace = getWorkspace({
      audioTrackId,
      workspaceId,
    })
    const scale = [0, initRightEdgeX]
    const newLeftEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: x,
      tickScale: scale,
    })
    const newWorkspaceWidth = initRightEdgeX - newLeftEdgeX

    const deltaWidth = newWorkspaceWidth - workspace.width
    workspace.startPosition = newLeftEdgeX
    workspace.width = newWorkspaceWidth
    const noteItemsMap = workspace.noteItemsMap
    for (const noteItem of noteItemsMap.values()) {
      noteItem.relativeX += deltaWidth
    }
    return [newLeftEdgeX, x]
  }

  function deleteWorkspace({ audioTrackId, workspaceId }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId,
    })
    workspaceMap?.delete(workspaceId)
  }
  registerDeleteSubTrackEvent(deleteWorkspace)

  function getWorkspaceMap({ audioTrackId }) {
    return trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId,
    })
  }
  function getWorkspace({ audioTrackId, workspaceId }) {
    return getWorkspaceMap({ audioTrackId })?.get(workspaceId)
  }
  return {
    generateWorkspaceId,
    generateAudioFileClipId,
    shallCreateWorkspace,
    createNewWorkspaceMap,
    addNewWorkspace,
    updateWorkspaceInfo,
    updateWorkspacePosition,
    updateLeftEdge,
    updateRightEdge,
    getWorkspace,
    getWorkspaceMap,
    deleteWorkspace,
  }
})

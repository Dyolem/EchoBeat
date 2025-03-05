import { defineStore, storeToRefs } from "pinia"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { alignToGrid } from "@/utils/alignToGrid.js"
import {
  ALIGN_TYPE_ENUM,
  ID_SET,
  MAIN_EDITOR_ID,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { computed } from "vue"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const noteItemStore = useNoteItemStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const zoomRatioStore = useZoomRatioStore()
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
  const convert = zoomRatioStore.createConvert(SUBORDINATE_EDITOR_ID)
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
  function computedStartPosition(createPosition, workspaceMap) {
    // if(!workspaceMap) return
    const createNewWorkspaceThreshold = widthPerMeasure.value * 2
    const x = createPosition
    const sortedWorkspaceArr = Array.from(workspaceMap.values()).sort(
      (a, b) => {
        return a.startPosition - b.startPosition
      },
    )
    if (sortedWorkspaceArr.length === 0) {
      const rightWorkspace = {
        startPosition: maxEditorWidth.value,
      }
      return createNewWorkspaceAtLeftSide({
        createPosition,
        rightWorkspace,
        maxNewWorkspaceWidth: maxEditorWidth.value,
      })
    }
    for (const workspace of sortedWorkspaceArr) {
      if (
        x >= workspace.startPosition &&
        x < workspace.startPosition + workspace.width
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
      return workspace.startPosition > x
    })
    if (index >= 1) {
      const leftWorkspace = sortedWorkspaceArr[index - 1]
      const rightWorkspace = sortedWorkspaceArr[index]
      const restSpace =
        rightWorkspace.startPosition -
        (leftWorkspace.startPosition + leftWorkspace.width)
      if (
        x - (leftWorkspace.startPosition + leftWorkspace.width) <=
        createNewWorkspaceThreshold
      ) {
        return stretchWorkspaceAtRightSide({
          createPosition,
          leftWorkspace,
          maxStretchableSpace: restSpace,
        })
      } else {
        return createNewWorkspaceAtLeftSide({
          createPosition,
          rightWorkspace,
          maxNewWorkspaceWidth: restSpace,
        })
      }
    } else if (index === 0) {
      const rightWorkspace = sortedWorkspaceArr[index]
      const restSpace = rightWorkspace.startPosition
      return createNewWorkspaceAtLeftSide({
        createPosition,
        rightWorkspace,
        maxNewWorkspaceWidth: restSpace,
      })
    } else if (index === -1) {
      const leftWorkspace = sortedWorkspaceArr[sortedWorkspaceArr.length - 1]
      const restSpace =
        maxEditorWidth.value -
        (leftWorkspace.startPosition + leftWorkspace.width)
      if (
        x - (leftWorkspace.startPosition + leftWorkspace.width) <=
        createNewWorkspaceThreshold
      ) {
        return stretchWorkspaceAtRightSide({
          createPosition,
          leftWorkspace,
          maxStretchableSpace: restSpace,
        })
      } else {
        const rightWorkspace = {
          startPosition: maxEditorWidth.value,
        }
        return createNewWorkspaceAtLeftSide({
          createPosition,
          rightWorkspace,
          maxNewWorkspaceWidth: restSpace,
        })
      }
    }
  }

  function shallCreateWorkspace({ audioTrackId, startPosition }) {
    const { workspaceBadgeName, workspaceMap, zoomRatio } =
      trackFeatureMapStore.getSelectedTrackFeature({
        selectedAudioTrackId: audioTrackId,
        featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
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
        workspaceBadgeName,
        noteItemsMap: noteItemsMap,
        width,
        startPosition,
        zoomRatio,
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
          workspaceBadgeName,
          zoomRatio,
          subTrackItemId: workspace.subTrackItemId,
        },
      }
    }
  }
  function createNewWorkspaceMap() {
    return new Map()
  }

  function addNewWorkspace({
    audioTrackId,
    badgeName,
    width,
    startPosition,
    zoomRatio,
  }) {
    const { workspaceMap } = trackFeatureMapStore.getSelectedTrackFeature({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const newId = generateWorkspaceId()
    const noteItemsMap = noteItemStore.createNoteItemsMap()
    const workspaceContent = {
      id: newId,
      audioTrackId,
      workspaceBadgeName: badgeName,
      noteItemsMap,
      width,
      startPosition,
      zoomRatio,
      subTrackItemId: "",
    }
    workspaceMap.set(newId, workspaceContent)
    return newId
  }
  function passivePatchUpdateWorkspaceWithZoomRatio({
    audioTrackId,
    newZoomRatio,
    oldZoomRatio,
  }) {
    if (
      audioTrackId === undefined ||
      newZoomRatio === oldZoomRatio ||
      newZoomRatio === undefined ||
      oldZoomRatio === undefined
    )
      return
    const midiWorkspaceInfo = trackFeatureMapStore.getSelectedTrackFeature({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    if (!midiWorkspaceInfo) return
    midiWorkspaceInfo.zoomRatio = newZoomRatio
    const workspaceMap = midiWorkspaceInfo.workspaceMap
    for (const workspace of workspaceMap.values()) {
      workspace.width *= newZoomRatio / oldZoomRatio
      workspace.startPosition =
        (workspace.startPosition / oldZoomRatio) * newZoomRatio
      if (workspace.audioTrackId === audioTrackId)
        workspace.zoomRatio = newZoomRatio
    }
  }

  const convertDataFromMainToSub = (value) => {
    return zoomRatioStore.convertDataBetweenEditors({
      fromValue: value,
      fromZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(MAIN_EDITOR_ID),
      toZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(
        SUBORDINATE_EDITOR_ID,
      ),
    })
  }

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
    const { convertedX: newStartPosition } = convert({
      x: startPosition,
      editorId,
      scale: positionScale,
    })
    const oldStartPosition = workspace.startPosition
    workspace.startPosition = newStartPosition
    return [newStartPosition, oldStartPosition]
  }

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
    const { convertedX, convertedScale } = convert({ x, editorId, scale })
    const { min: convertedLeftEdgeX } = convertedScale
    workspace.width = convertedX - convertedLeftEdgeX

    return [convertedX, x]
  }

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
    const { convertedX, convertedScale } = convert({ x, editorId, scale })
    const { max: convertedRightEdgeX } = convertedScale
    const newWorkspaceWidth = convertedRightEdgeX - convertedX

    const deltaWidth = newWorkspaceWidth - workspace.width
    workspace.startPosition = convertedX
    workspace.width = newWorkspaceWidth
    const noteItemsMap = workspace.noteItemsMap
    for (const noteItemsMapItem of noteItemsMap.values()) {
      for (const noteItem of noteItemsMapItem.noteItems) {
        noteItem.relativeX += deltaWidth
      }
    }
    return [convertedX, x]
  }

  function deleteWorkspace({ audioTrackId, workspaceId }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    workspaceMap?.delete(workspaceId)
  }

  function getWorkspaceMap({ audioTrackId }) {
    return trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
  }
  function getWorkspace({ audioTrackId, workspaceId }) {
    return getWorkspaceMap({ audioTrackId })?.get(workspaceId)
  }
  return {
    generateWorkspaceId,
    shallCreateWorkspace,
    createNewWorkspaceMap,
    addNewWorkspace,
    updateWorkspacePosition,
    updateLeftEdge,
    updateRightEdge,
    getWorkspace,
    getWorkspaceMap,
    deleteWorkspace,
    passivePatchUpdateWorkspaceWithZoomRatio,
  }
})

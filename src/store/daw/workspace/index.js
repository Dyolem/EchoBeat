import { defineStore } from "pinia"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { alignToGrid, snapToGrid } from "@/utils/alignToGrid.js"
import {
  ALIGN_TYPE_ENUM,
  ID_SET,
  MAIN_EDITOR_ID,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { clamp } from "@/utils/clamp.js"
import { useEditor } from "@/store/daw/editor.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const editorGridParametersStore = useEditorGridParametersStore()
  const noteItemStore = useNoteItemStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const zoomRatioStore = useZoomRatioStore()
  const editor = useEditor()
  const beatControllerStore = useBeatControllerStore()

  const generateWorkspaceId = (prefix) => ID_SET.WORKSPACE(prefix)
  const convert = zoomRatioStore.createConvert(SUBORDINATE_EDITOR_ID)
  function createNewWorkspaceAtLeftSide({
    createPosition,
    rightWorkspace,
    maxNewWorkspaceWidth,
  }) {
    const { widthPerBeat, minGridHorizontalMovement } =
      editor.editorMap.get(MAIN_EDITOR_ID)
    let startPosition = 0
    let width = 0
    if (maxNewWorkspaceWidth >= widthPerBeat) {
      width = widthPerBeat
      startPosition = Math.min(
        createPosition,
        rightWorkspace.startPosition - widthPerBeat,
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
    const { widthPerBeat } = editor.editorMap.get(MAIN_EDITOR_ID)
    const createNewWorkspaceThreshold = widthPerBeat * 2
    let stretchIncrement = 0
    if (
      createPosition - (leftWorkspace.startPosition + leftWorkspace.width) >
      widthPerBeat
    ) {
      stretchIncrement = Math.min(
        createNewWorkspaceThreshold,
        maxStretchableSpace,
      )
    } else {
      stretchIncrement = Math.min(widthPerBeat, maxStretchableSpace)
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
    const { widthPerBeat, width: maxEditorWidth } =
      editor.editorMap.get(MAIN_EDITOR_ID)
    const createNewWorkspaceThreshold = widthPerBeat * 2
    const x = createPosition
    const sortedWorkspaceArr = Array.from(workspaceMap.values()).sort(
      (a, b) => {
        return a.startPosition - b.startPosition
      },
    )
    if (sortedWorkspaceArr.length === 0) {
      const rightWorkspace = {
        startPosition: maxEditorWidth,
      }
      return createNewWorkspaceAtLeftSide({
        createPosition,
        rightWorkspace,
        maxNewWorkspaceWidth: maxEditorWidth,
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
        maxEditorWidth - (leftWorkspace.startPosition + leftWorkspace.width)
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
          startPosition: maxEditorWidth,
        }
        return createNewWorkspaceAtLeftSide({
          createPosition,
          rightWorkspace,
          maxNewWorkspaceWidth: restSpace,
        })
      }
    }
  }

  /**
   * @typedef {import('../type.js').NoteItemsMap} NoteItemsMap
   * @param {string} audioTrackId
   * @param {string} workspaceBadgeName
   * @param {number} startPosition
   * @param {number} zoomRatio
   * @param {NoteItemsMap} noteItemsMap
   * @returns {{id: string, workspaceBadgeName:string, noteItemsMap:NoteItemsMap, width: number, startPosition: number}}
   */

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

  function updateWorkspaceWidth({
    workspaceId,
    selectedAudioTrackId,
    scale,
    initStartPosition,
    initWidth,
    mousedownX,
    stretchStart,
    stretchEnd,
    stretchableDirection = {
      leftSide: { positive: true, negative: true },
      rightSide: { positive: true, negative: true },
    },
    isActive = true,
  }) {
    let [minWidth, maxWidth] = scale
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const { leftSide, rightSide } = stretchableDirection
    const middlePoint = initWidth / 2
    let newWidth = workspace.width
    if (!isActive) {
      // newWidth = convertDataFromMainToSub(newWidth)
      initStartPosition = convertDataFromMainToSub(initStartPosition)
      stretchStart = convertDataFromMainToSub(stretchStart)
      stretchEnd = convertDataFromMainToSub(stretchEnd)
      minWidth = convertDataFromMainToSub(minWidth)
      maxWidth = convertDataFromMainToSub(maxWidth)
      initWidth = convertDataFromMainToSub(initWidth)
    }
    let newStartPosition = initStartPosition
    const stretchedLength = stretchEnd - stretchStart
    const edgeTriggerWidth = 2
    //由于拖拽吸附是左对齐，光标移动过快会导致缺失关键点判断，比如在40px像素时，note需要从20吸附至40，如果光标移动过快，
    //光标的两次判断是39像素和41像素判断一次，39像素未达到吸附阈值，而41像素虽然达到，但是由于下面的判断语句，如果不加上额外的缓冲值就会结束本次应该吸附的判断
    //如果后续拖拽吸附可能改为右对齐，需要重新梳理这里的逻辑
    if (mousedownX < middlePoint) {
      //left side stretch
      if (
        leftSide.positive === stretchedLength >= -edgeTriggerWidth ||
        leftSide.negative === stretchedLength <= edgeTriggerWidth
      ) {
        newStartPosition = initStartPosition + stretchedLength

        const [newWorkspacePosition, oldWorkspacePosition] =
          updateWorkspacePosition({
            workspaceId,
            selectedAudioTrackId,
            startPosition: newStartPosition,
            positionScale: [0, maxWidth - initWidth],
            stretchableUpdate: true,
          })
        newStartPosition = newWorkspacePosition
        newWidth -= newWorkspacePosition - oldWorkspacePosition
      }
    } else {
      //right side stretch
      if (
        rightSide.positive === stretchedLength >= -edgeTriggerWidth ||
        rightSide.negative === stretchedLength <= edgeTriggerWidth
      ) {
        newWidth = initWidth + stretchedLength
      }
    }
    newWidth = clamp(newWidth, [minWidth, maxWidth])
    newWidth =
      snapToGrid(newWidth + newStartPosition, {
        gridSize: editorGridParametersStore.minGridHorizontalMovement,
      }) - newStartPosition
    workspace.width = newWidth
    console.log(newWidth)

    return {
      newWidth,
      newStartPosition,
    }
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
    updateWorkspacePosition,
    updateLeftEdge,
    updateRightEdge,
    getWorkspace,
    getWorkspaceMap,
    deleteWorkspace,
    passivePatchUpdateWorkspaceWithZoomRatio,
  }
})

import { defineStore } from "pinia"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { alignToGrid } from "@/utils/alignToGrid.js"
import {
  ALIGN_TYPE_ENUM,
  ID_SET,
  MAIN_EDITOR_ID,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { clamp } from "@/utils/clamp.js"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const editorGridParametersStore = useEditorGridParametersStore()
  const noteItemStore = useNoteItemStore()
  const audioStore = useAudioStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const mixTrackEditorStore = useMixTrackEditorStore()
  const zoomRatioStore = useZoomRatioStore()

  const generateWorkspaceId = (prefix) => ID_SET.WORKSPACE(prefix)
  function createNewWorkspaceAtLeftSide({
    createPosition,
    rightWorkspace,
    maxNewWorkspaceWidth,
  }) {
    let startPosition = 0
    let width = 0
    if (maxNewWorkspaceWidth >= editorGridParametersStore.widthPerBeat) {
      width = editorGridParametersStore.widthPerBeat
      startPosition = Math.min(
        createPosition,
        rightWorkspace.startPosition - editorGridParametersStore.widthPerBeat,
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
          gridSize: editorGridParametersStore.minGridHorizontalMovement,
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
    let stretchIncrement = 0
    if (
      createPosition - (leftWorkspace.startPosition + leftWorkspace.width) >
      editorGridParametersStore.widthPerBeat
    ) {
      stretchIncrement = Math.min(
        editorGridParametersStore.createNewWorkspaceThreshold,
        maxStretchableSpace,
      )
    } else {
      stretchIncrement = Math.min(
        editorGridParametersStore.widthPerBeat,
        maxStretchableSpace,
      )
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
    const x = createPosition
    const sortedWorkspaceArr = Array.from(workspaceMap.values()).sort(
      (a, b) => {
        return a.startPosition - b.startPosition
      },
    )
    if (sortedWorkspaceArr.length === 0) {
      const rightWorkspace = {
        startPosition: editorGridParametersStore.maxEditorWidth,
      }
      return createNewWorkspaceAtLeftSide({
        createPosition,
        rightWorkspace,
        maxNewWorkspaceWidth: editorGridParametersStore.maxEditorWidth,
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
        editorGridParametersStore.createNewWorkspaceThreshold
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
        editorGridParametersStore.maxEditorWidth -
        (leftWorkspace.startPosition + leftWorkspace.width)
      if (
        x - (leftWorkspace.startPosition + leftWorkspace.width) <=
        editorGridParametersStore.createNewWorkspaceThreshold
      ) {
        return stretchWorkspaceAtRightSide({
          createPosition,
          leftWorkspace,
          maxStretchableSpace: restSpace,
        })
      } else {
        const rightWorkspace = {
          startPosition: editorGridParametersStore.maxEditorWidth,
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
    workspaceId,
    selectedAudioTrackId,
    startPosition,
    positionScale,
    stretchableUpdate = false,
    isActive = true,
  }) {
    const midiWorkspaceInfo = trackFeatureMapStore.getSelectedTrackFeature({
      selectedAudioTrackId: selectedAudioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspaceMap = midiWorkspaceInfo.workspaceMap
    const workspace = workspaceMap.get(workspaceId)
    let oldWorkspacePosition = workspace.startPosition
    let newWorkspacePosition = workspace.startPosition
    if (!workspace) return [newWorkspacePosition, oldWorkspacePosition]
    let [minPosition, maxPosition] = positionScale
    if (startPosition < minPosition || startPosition > maxPosition)
      return [
        Math.min(Math.max(newWorkspacePosition, minPosition), maxPosition),
        oldWorkspacePosition,
      ]

    const snapJudgedStartPosition = noteItemStore.isSnappedToHorizontalGrid
      ? alignToGrid(startPosition, {
          gridSize: editorGridParametersStore.minGridHorizontalMovement,
          alignType: ALIGN_TYPE_ENUM.LEFT_JUSTIFYING,
        })
      : startPosition
    newWorkspacePosition = snapJudgedStartPosition
    newWorkspacePosition = isActive
      ? newWorkspacePosition
      : convertDataFromMainToSub(newWorkspacePosition)
    if (newWorkspacePosition === oldWorkspacePosition)
      return [newWorkspacePosition, oldWorkspacePosition]

    if (!stretchableUpdate) {
      const noteItemsMap = workspace.noteItemsMap
      for (const { noteItems } of noteItemsMap.values()) {
        for (const noteItem of noteItems) {
          let newX = noteItem.x - oldWorkspacePosition + newWorkspacePosition

          noteItem.x = newX
          const newStartTime = noteItemStore.getStartTime(newX)
          noteItem.startTime = newStartTime
          audioStore.adjustNodeStartAndLastTime({
            id: noteItem.id,
            startTime: newStartTime,
            duration: noteItem.duration,
            pitchName: noteItem.pitchName,
            audioContext: noteItem.audioContext,
          })
        }
      }
    }

    workspace.startPosition = newWorkspacePosition
    return [newWorkspacePosition, oldWorkspacePosition]
  }

  function updateWorkspaceWidth({
    workspaceId,
    selectedAudioTrackId,
    maxWidth,
    minWidth,
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
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const { leftSide, rightSide } = stretchableDirection
    const middlePoint = initWidth / 2
    let newWidth = workspace.width
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
            isActive,
          })
        newStartPosition = newWorkspacePosition
        if (newWorkspacePosition !== oldWorkspacePosition) {
          newWidth = clamp(
            newWidth - (newWorkspacePosition - oldWorkspacePosition),
            [minWidth, maxWidth],
          )
        }
      }
    } else {
      //right side stretch
      if (
        rightSide.positive === stretchedLength >= -edgeTriggerWidth ||
        rightSide.negative === stretchedLength <= edgeTriggerWidth
      ) {
        newWidth = clamp(initWidth + stretchedLength, [minWidth, maxWidth])
      }
    }
    newWidth = isActive ? newWidth : convertDataFromMainToSub(newWidth)
    workspace.width = newWidth

    return {
      newWidth,
      newStartPosition,
    }
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
    updateWorkspaceWidth,
    getWorkspace,
    getWorkspaceMap,
    deleteWorkspace,
    passivePatchUpdateWorkspaceWithZoomRatio,
  }
})

import { defineStore } from "pinia"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const editorGridParametersStore = useEditorGridParametersStore()
  const noteItemStore = useNoteItemStore()
  const audioStore = useAudioStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const mixTrackEditorStore = useMixTrackEditorStore()

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
        startPosition: noteItemStore.leftJustifyingGrid(startPosition),
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
        modifiedWorkspaceId: leftWorkspace.id,
        width: newWidth,
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
   * @param {string} type
   * @param {number} startPosition
   * @param {number} zoomRatio
   * @param {NoteItemsMap} noteItemsMap
   * @returns {{id: string, type:string, noteItemsMap:NoteItemsMap, width: number, startPosition: number}}
   */
  function createWorkspace({
    audioTrackId,
    type,
    startPosition,
    noteItemsMap,
    zoomRatio,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const { isCreateNewWorkspace, workspaceInfo } = computedStartPosition(
      startPosition,
      workspaceMap,
    )
    if (isCreateNewWorkspace) {
      const { startPosition, width } = workspaceInfo
      const date = new Date()
      const id = `${workspaceMap.size + 1}${date.getTime()}`
      const workspaceContent = {
        id,
        audioTrackId,
        type,
        noteItemsMap: noteItemsMap,
        width,
        startPosition,
        zoomRatio,
      }
      workspaceMap.set(id, workspaceContent)
      return workspaceContent
    } else {
      const { width, modifiedWorkspaceId } = workspaceInfo
      const workspaceContent = workspaceMap.get(modifiedWorkspaceId)
      workspaceContent.width = width
      return workspaceContent
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

  function updateWorkspacePosition({
    workspaceId,
    selectedAudioTrackId,
    startPosition,
    positionScale,
    stretchableUpdate = false,
  }) {
    let oldWorkspacePosition = 0
    let newWorkspacePosition = 0
    const [minPosition, maxPosition] = positionScale
    if (startPosition < minPosition || startPosition > maxPosition)
      return [newWorkspacePosition, oldWorkspacePosition]

    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: selectedAudioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    if (!workspace) return [newWorkspacePosition, oldWorkspacePosition]

    oldWorkspacePosition = workspace.startPosition
    const snapJudgedStartPosition = noteItemStore.isSnappedToHorizontalGrid
      ? noteItemStore.leftJustifyingGrid(startPosition)
      : startPosition
    newWorkspacePosition = snapJudgedStartPosition

    if (newWorkspacePosition === oldWorkspacePosition)
      return [newWorkspacePosition, oldWorkspacePosition]

    if (!stretchableUpdate) {
      const noteItemsMap = workspace.noteItemsMap
      for (const { noteItems } of noteItemsMap.values()) {
        for (const noteItem of noteItems) {
          let newX = noteItem.x - oldWorkspacePosition + snapJudgedStartPosition

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
    initWorkspaceStartPosition,
    initWorkspaceWidth,
    mousedownX,
    stretchStart,
    stretchEnd,
    stretchableDirection = {
      leftSide: { positive: true, negative: true },
      rightSide: { positive: true, negative: true },
    },
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const { leftSide, rightSide } = stretchableDirection
    const middlePoint = initWorkspaceWidth / 2
    let newWidth = workspace.width
    let newX = initWorkspaceStartPosition
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
        newX = initWorkspaceStartPosition + stretchedLength

        const [newWorkspacePosition, oldWorkspacePosition] =
          updateWorkspacePosition({
            workspaceId,
            selectedAudioTrackId,
            startPosition: newX,
            positionScale: [0, maxWidth - initWorkspaceWidth],
            stretchableUpdate: true,
          })

        if (newWorkspacePosition !== oldWorkspacePosition) {
          newWidth = Math.min(
            Math.max(
              newWidth - (newWorkspacePosition - oldWorkspacePosition),
              minWidth,
            ),
            maxWidth,
          )
        }
      }
    } else {
      //right side stretch
      if (
        rightSide.positive === stretchedLength >= -edgeTriggerWidth ||
        rightSide.negative === stretchedLength <= edgeTriggerWidth
      ) {
        newWidth = Math.min(
          Math.max(initWorkspaceWidth + stretchedLength, minWidth),
          maxWidth,
        )
      }
    }
    workspace.width = newWidth
  }
  return {
    createWorkspace,
    createNewWorkspaceMap,
    updateWorkspacePosition,
    updateWorkspaceWidth,
    passivePatchUpdateWorkspaceWithZoomRatio,
  }
})

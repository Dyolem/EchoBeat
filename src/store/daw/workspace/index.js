import { defineStore } from "pinia"
import { ref } from "vue"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useAudioStore } from "@/store/daw/audio/index.js"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const editorGridParametersStore = useEditorGridParametersStore()
  const noteItemStore = useNoteItemStore()
  const audioStore = useAudioStore()
  const workspaceMap = ref(new Map())
  const workspaceStartPosition = ref(0)
  function shouldCreateWorkspace(
    x,
    { leftWorkspaceStartPosition, rightWorkspaceStartPosition },
  ) {
    if (
      leftWorkspaceStartPosition === undefined &&
      rightWorkspaceStartPosition !== undefined
    )
      return true
    if (
      leftWorkspaceStartPosition === undefined &&
      rightWorkspaceStartPosition === undefined
    )
      return true
    if (leftWorkspaceStartPosition !== undefined) {
      return (
        x >
        editorGridParametersStore.widthPerBeat * 3 + leftWorkspaceStartPosition
      )
    }

    // if(leftWorkspaceStartPosition !==undefined && rightWorkspaceStartPosition!==undefined) {
    //   return x>editorGridParametersStore.widthPerBeat *3 + leftWorkspaceStartPosition
    // }
  }
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
  function computedStartPosition(createPosition) {
    const x = createPosition
    const sortedWorkspaceArr = Array.from(workspaceMap.value.values()).sort(
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
  function createWorkspace({ type, width, startPosition, noteItemsMap }) {
    const { isCreateNewWorkspace, workspaceInfo } =
      computedStartPosition(startPosition)
    if (isCreateNewWorkspace) {
      const { startPosition, width } = workspaceInfo
      workspaceStartPosition.value = startPosition
      const date = new Date()
      const id = `${workspaceMap.value.size + 1}${date.getTime()}`
      const workspaceContent = {
        id,
        type,
        noteItemsMap: noteItemsMap,
        width,
        startPosition,
      }
      workspaceMap.value.set(id, workspaceContent)
      return workspaceContent
    } else {
      const { width, modifiedWorkspaceId } = workspaceInfo
      const workspaceContent = workspaceMap.value.get(modifiedWorkspaceId)
      workspaceContent.width = width
      workspaceStartPosition.value = workspaceContent.startPosition

      return workspaceContent
    }
  }
  function patchUpdateWorkspaceWithZoomRatio(newZoomRatio, oldZoomRatio) {
    if (
      newZoomRatio === oldZoomRatio ||
      newZoomRatio === undefined ||
      oldZoomRatio === undefined
    )
      return
    for (const workspace of workspaceMap.value.values()) {
      workspace.width *= newZoomRatio / oldZoomRatio
      workspace.startPosition *= newZoomRatio / oldZoomRatio
    }
  }
  function updateWorkspacePosition({ workspaceId, movement }) {
    const workspace = workspaceMap.value.get(workspaceId)
    if (!workspace) return
    workspace.startPosition = noteItemStore.isSnappedToHorizontalGrid
      ? noteItemStore.leftJustifyingGrid(movement)
      : movement

    const noteItemsMap = workspace.noteItemsMap
    for (const { noteItems } of noteItemsMap.values()) {
      for (const noteItem of noteItems) {
        const newStartTime = noteItemStore.getStartTime(
          noteItem.x - noteItem.workspaceStartPosition + movement,
        )
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
  return {
    workspaceMap,
    createWorkspace,
    workspaceStartPosition,
    updateWorkspacePosition,
    patchUpdateWorkspaceWithZoomRatio,
  }
})

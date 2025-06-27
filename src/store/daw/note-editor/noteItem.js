import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  ALIGN_TYPE_ENUM,
  SUBORDINATE_EDITOR_ID,
  CHROMATIC_SCALE_SERIAL_NUMBER,
  CHROMATIC_PITCH_NAME_ENUM,
  NATURAL_SEMITONE,
  OCTAVE_KEY_COUNT,
  DEFAULT_INIT_VELOCITY,
  VELOCITY_SCALE,
} from "@/constants/daw/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { alignToGrid } from "@/utils/alignToGrid.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { clamp } from "@/utils/clamp.js"
import { usePianoKeySizeStore } from "@/store/daw/pianoKeySize.js"
import { snapToTickUnitGrid } from "@/core/grid-size/snapToTickUnitGrid.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"

export const useNoteItemStore = defineStore("noteItem", () => {
  const zoomRatioStore = useZoomRatioStore()
  const mixTrackEditorStore = useMixTrackEditorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const workspaceStore = useWorkspaceStore()
  const beatControllerStore = useBeatControllerStore()
  const pianoKeySizeStore = usePianoKeySizeStore()

  const nextInsertedNoteWidth = ref(0)
  const noteWidth = computed(() => {
    return (
      nextInsertedNoteWidth.value ||
      beatControllerStore.factualDisplayedGridWidth(SUBORDINATE_EDITOR_ID)
    )
  })
  const noteHeight = computed(() => {
    return pianoKeySizeStore.noteTrackHeight
  })
  const maxY = computed(() => {
    return (
      noteHeight.value * OCTAVE_KEY_COUNT * CHROMATIC_SCALE_SERIAL_NUMBER.length
    )
  })
  const octaveContainerInstance = ref(null)

  const pitchNameMappedToArea = computed(() => {
    const pitchNameMappedToAreaArr = []
    let count = 0
    for (const chromaticScale of CHROMATIC_SCALE_SERIAL_NUMBER.toReversed()) {
      for (const chromaticPitchName of CHROMATIC_PITCH_NAME_ENUM.toReversed()) {
        if (!NATURAL_SEMITONE.includes(chromaticPitchName)) {
          pitchNameMappedToAreaArr.push({
            pitchName: chromaticPitchName + "#" + chromaticScale,
            scale: [count * noteHeight.value, (count + 1) * noteHeight.value],
          })
          count++
        }
        pitchNameMappedToAreaArr.push({
          pitchName: chromaticPitchName + chromaticScale,
          scale: [count * noteHeight.value, (count + 1) * noteHeight.value],
        })
        count++
      }
    }
    return pitchNameMappedToAreaArr
  })

  /**
   * @typedef {string} NoteId - note 元素的唯一标识符
   */
  /**
   * @typedef {Object} NoteItem
   * @property {NoteId} id - note 元素的唯一标识符
   * @property {string} workspaceId - 所属工作区的 ID
   * @property {string} audioTrackId - 关联的音频轨道 ID
   * @property {number} width - note 元素的宽度（基于绝对时间参考系，单位：tick）
   * @property {number} height - note 元素的高度（单位：像素值）
   * @property {number} relativeX - note 元素相对于工作区左上角原点的相对横坐标（基于绝对时间参考系，单位：tick）
   * @property {number} y - note 元素相对于 MIDI 编辑器左上角原点的绝对纵坐标
   * @property {PitchNameId} pitchName - 音高名称
   * @property {number} velocity - 音符力度（0-127）

  /**
   * @returns {Map<NoteId, NoteItem>}
   */
  function createNoteItemsMap() {
    /** @type {Map<NoteId, NoteItem>} */
    return new Map()
  }

  function getInsertToSpecifiedPitchName({ y, pitchNameMappedToArea } = {}) {
    if (pitchNameMappedToArea === undefined || y === undefined) return
    let insertToSpecifiedPitchName = ""
    const res = pitchNameMappedToArea.find((item) => {
      const [startY, endY] = item.scale
      if (y >= startY && y < endY) {
        return true
      }
    })
    insertToSpecifiedPitchName = res?.pitchName ?? ""
    return insertToSpecifiedPitchName
  }

  function getId(noteItemsMap) {
    if (noteItemsMap === undefined) return
    const count = noteItemsMap.size
    const date = new Date()
    const fetchTime = date.getTime()
    const prefix = "note"
    return `${prefix}-${count}-${fetchTime}`
  }

  function getNoteItemTemplate({
    x: tickX,
    y,
    noteItemWidth = noteWidth.value,
    insertToSpecifiedPitchName = getInsertToSpecifiedPitchName({
      y,
      pitchNameMappedToArea: pitchNameMappedToArea.value,
    }),
    workspaceId,
    audioTrackId,
    velocity = DEFAULT_INIT_VELOCITY,
    isDirectPosition = false,
  }) {
    const newWorkspace = workspaceStore.getWorkspace({
      workspaceId,
      audioTrackId,
    })
    const id = getId(newWorkspace.noteItemsMap)
    const scaleX = [
      newWorkspace.startPosition,
      newWorkspace.startPosition + newWorkspace.width,
    ]
    const scaleY = [0, maxY.value]
    let position = [tickX, y]
    let pitchName = insertToSpecifiedPitchName
    if (!isDirectPosition) {
      const { alignedAbsolutePosition, alignedPitchName } =
        alignToOtherPitchNameTrack({
          absolutePosition: [tickX, y],
          scale: [scaleX, scaleY],
        })
      if (!alignedPitchName) return
      pitchName = alignedPitchName
      position = alignedAbsolutePosition
    }

    const [computedTickX, computedY] = position
    const relativeX = computedTickX - newWorkspace.startPosition
    const minNoteWidth = 0
    const maxNoteWidth = newWorkspace.width - relativeX
    return {
      id: id,
      workspaceId,
      audioTrackId,
      width: clamp(noteItemWidth, [minNoteWidth, maxNoteWidth]),
      height: noteHeight.value,
      relativeX,
      y: computedY,
      pitchName: pitchName,
      velocity,
    }
  }

  /**
   * 参数x为tick单位，参数y为px单位
   */
  function insertNoteItem(
    { editorId, audioTrackId, x, y, insertToSpecifiedPitchName } = {},
    returnInsertedItemFullInfo = false,
  ) {
    if (x === undefined || y === undefined || !audioTrackId) return

    const specifiedPitchName =
      insertToSpecifiedPitchName ??
      getInsertToSpecifiedPitchName({
        y,
        pitchNameMappedToArea: pitchNameMappedToArea.value,
      })

    const { workspace, isCreated } = workspaceStore.shallCreateWorkspace({
      audioTrackId,
      startPosition: x,
    })
    const { width, workspaceBadgeName, startPosition, id } = workspace
    const noteItemsMap = workspace.noteItemsMap
    if (isCreated) {
      const subTrackItemId = mixTrackEditorStore.createSubTrackItem({
        audioTrackId,
        workspaceId: id,
        trackItemWidth: width,
        startPosition: startPosition,
        trackName: workspaceBadgeName,
      })
      workspaceStore.getWorkspace({
        audioTrackId,
        workspaceId: id,
      }).subTrackItemId = subTrackItemId
    } else {
      mixTrackEditorStore.updateRightEdge({
        editorId: editorId,
        audioTrackId: audioTrackId,
        subTrackItemId: workspace.subTrackItemId,
        x: startPosition + width,
        initLeftEdgeX: startPosition,
      })
    }

    const template = getNoteItemTemplate({
      x,
      y,
      insertToSpecifiedPitchName: specifiedPitchName,
      workspaceId: id,
      audioTrackId,
    })
    if (!template) return
    noteItemsMap.set(template.id, template)
    return returnInsertedItemFullInfo ? template : template.id
  }

  function deleteNoteItem({
    id,
    workspaceId,
    audioTrackId,
    pitchName: deleteFromSpecifiedPitchName,
  }) {
    if (
      id === undefined ||
      workspaceId === undefined ||
      audioTrackId === undefined ||
      deleteFromSpecifiedPitchName === undefined
    )
      return
    const workspace = workspaceStore.getWorkspace({ audioTrackId, workspaceId })
    const noteItemsMap = workspace.noteItemsMap
    noteItemsMap.delete(id)
  }

  function alignToOtherPitchNameTrack({
    absolutePosition = [],
    scale,
    snappedToHorizontalGrid = zoomRatioStore.isSnappedToHorizontalGrid,
  }) {
    const [x, y] = absolutePosition
    const [scaleX, scaleY] = scale
    let alignedX = clamp(x, scaleX)
    let alignedY = clamp(y, scaleY)
    const expectedInsertToPitchName = getInsertToSpecifiedPitchName({
      y: alignedY,
      pitchNameMappedToArea: pitchNameMappedToArea.value,
    })

    const alignPosition = (position) => {
      const gridSize = [
        beatControllerStore.factualDisplayedGridWidth(SUBORDINATE_EDITOR_ID),
        noteHeight.value,
      ]
      return alignToGrid(position, {
        gridSize,
        alignType: ALIGN_TYPE_ENUM.TOP_LEFT_JUSTIFYING,
      })
    }
    const alignedAbsolutePosition = alignPosition(absolutePosition)
    if (snappedToHorizontalGrid) {
      alignedX = clamp(alignedAbsolutePosition.x, scaleX)
    }

    alignedY = clamp(alignedAbsolutePosition.y, scaleY)

    // if (mousedownPositionInNote.length === 0) {
    //   //insert logic
    //   snappedY = noteItemsMap.get(expectedInsertToPitchName)?.scaleY[0]
    //   snappedX = convertX(x)
    // } else {
    //   //update logic
    //   const [mousedownXInNote, mousedownYInNote] = mousedownPositionInNote
    //
    //   /*
    //    * const snappedX = Math.floor((x - mousedownXInNote) / minGridWidth.value) * minGridWidth.value
    //    * 根据算法，吸附网格的原理是移动位置x是网格值的整数倍时，更新一次x值，
    //    * 由于note元素自身有宽度，光标位置在元素内部，并不是元素的左上角，所以需要减去mousedownXInNote的值
    //    * 但这样导致一个问题：假设网格值为20，note位于(20,0)，宽度为20,光标相对于note元素的点击位置为(3，0)，相对于noteRegion元素的点击位置为(23，0)
    //    * 现在往右拖动17px，此时相对于note元素的点击位置为(20，0)，相对于noteRegion元素的点击位置为(40，0)
    //    * 此时40已经是网格值的20整数倍，所以需要进行一次移动，根据计算：Math.floor((40-3)/20)*20=20，可以发现note并不会移动，
    //    * 可以看出相对于noteRegion元素的点击位置为要大于等于43时才能让note移动，此后的移动阈值需要x满足63，83...
    //    * 这就违反了移动位置x是网格值的整数倍时的规则，而bug的产生原因在于减去的mousedownXInNote值，被提前进行了取整。
    //    * 然而减去mousedownXInNote的值是必须，因此可以单独对mousedownXInNote值进行取整，然后将取整的两个值相减。
    //    * */
    //
    //   snappedX = convertX(x) - convertX(mousedownXInNote)
    //   snappedY = convertX(y, "column") - convertX(mousedownYInNote, "column")
    // }
    return {
      alignedAbsolutePosition: [alignedX, alignedY],
      alignedPitchName: expectedInsertToPitchName,
    }
  }

  /**
   * 传入参数中absolutePosition的横向长度值为tick单位,纵向为px单位
   */
  function updateNoteItemPosition({
    id,
    selectedNotesIdMap,
    audioTrackId,
    workspaceId,
    pitchName,
    x,
    y,
  }) {
    if (
      id === undefined ||
      selectedNotesIdMap === undefined ||
      audioTrackId === undefined ||
      workspaceId === undefined ||
      pitchName === undefined ||
      x === undefined ||
      y === undefined
    )
      return Promise.reject(new Error("Parameters error"))
    const _pitchNameMappedToArea = pitchNameMappedToArea.value
    const workspaceMap = workspaceStore.getWorkspaceMap({ audioTrackId })
    const workspace = workspaceMap.get(workspaceId)
    const noteItemsMap = workspace.noteItemsMap
    const updateMainNote = noteItemsMap.get(id)

    const scaleX = [
      workspace.startPosition,
      workspace.startPosition + workspace.width - updateMainNote.width,
    ]
    const scaleY = [0, maxY.value]
    const oldAbsoluteX = updateMainNote.relativeX + workspace.startPosition
    const oldAbsoluteY = updateMainNote.y
    const { alignedAbsolutePosition, alignedPitchName } =
      alignToOtherPitchNameTrack({
        absolutePosition: [x, y],
        scale: [scaleX, scaleY],
      })
    if (!alignedPitchName)
      return Promise.reject(new Error("There's no matching pitch name"))
    const [tickAlignedAbsoluteX, alignedAbsoluteY] = alignedAbsolutePosition
    const incrementX = tickAlignedAbsoluteX - oldAbsoluteX
    const incrementY = alignedAbsoluteY - oldAbsoluteY

    const waitedUpdatePositionArr = []
    for (const [selectedNoteId, idsGroup] of selectedNotesIdMap) {
      if (selectedNoteId === id) continue
      const { audioTrackId, workspaceId } = idsGroup
      const updateNoteTarget = getSpecifiedNoteItem({
        audioTrackId,
        workspaceId,
        noteId: selectedNoteId,
      })
      if (updateNoteTarget === undefined) continue

      const workspace = workspaceMap.get(updateNoteTarget.workspaceId)
      const scaleX = [
        workspace.startPosition,
        workspace.startPosition + workspace.width - updateNoteTarget.width,
      ]
      const scaleY = [0, maxY.value]

      const updatePositionWork = new Promise((resolve, reject) => {
        const [minX, maxX] = scaleX
        const [minY, maxY] = scaleY
        const factualX =
          updateNoteTarget.relativeX + workspace.startPosition + incrementX
        const factualY = updateNoteTarget.y + incrementY
        const horizontalJudgement = factualX >= minX && factualX <= maxX
        const verticalJudgement = factualY >= minY && factualY <= maxY

        if (!horizontalJudgement || !verticalJudgement) {
          reject(
            new Error("note element coordinates are out of workspace scope"),
          )
        } else {
          resolve({
            updateNoteTarget,
            workspace,
            absolutePosition: [factualX, factualY],
          })
        }
      })
      waitedUpdatePositionArr.push(updatePositionWork)
    }

    return Promise.all(waitedUpdatePositionArr).then(
      (updateInfoArr) => {
        updateMainNote.relativeX =
          tickAlignedAbsoluteX - workspace.startPosition
        updateMainNote.y = alignedAbsoluteY
        updateMainNote.pitchName = alignedPitchName

        for (const {
          updateNoteTarget,
          workspace,
          absolutePosition,
        } of updateInfoArr) {
          const [absoluteX, absoluteY] = absolutePosition
          updateNoteTarget.relativeX = absoluteX - workspace.startPosition
          updateNoteTarget.y = absoluteY
          updateNoteTarget.pitchName = getInsertToSpecifiedPitchName({
            y: absoluteY,
            pitchNameMappedToArea: _pitchNameMappedToArea,
          })
        }

        return {
          newPitchName: alignedPitchName,
        }
      },
      (reason) => {
        // 注意需要显式返回拒绝，不返回会被后续调用链认作已兑现（兑现值为undefined）
        return Promise.reject(reason)
      },
    )
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateNoteRightEdge({
    editorId,
    id,
    selectedNotesId,
    audioTrackId,
    workspaceId,
    absoluteX,
    initLeftEdgeX,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId,
    })
    const workspace = workspaceMap.get(workspaceId)
    const noteItemsMap = workspace.noteItemsMap
    const updateNoteTarget = noteItemsMap.get(id)

    const scale = [initLeftEdgeX, workspace.width + workspace.startPosition]
    const oldNoteWidth = updateNoteTarget.width
    const oldRightEdgeX =
      updateNoteTarget.relativeX + workspace.startPosition + oldNoteWidth
    const newRightEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: absoluteX,
      tickScale: scale,
    })
    const newNoteWidth = newRightEdgeX - initLeftEdgeX

    const rightEdgeXIncrement = newRightEdgeX - oldRightEdgeX
    const noteWidthIncrement = newNoteWidth - oldNoteWidth

    const updateNoteRightEdgeArr = []
    for (const [noteId, idsGroup] of selectedNotesId) {
      if (noteId === id) continue
      const { audioTrackId, workspaceId } = idsGroup
      const waitedUpdateNoteRightEdgeWork = new Promise((resolve, reject) => {
        const otherNoteTarget = getSpecifiedNoteItem({
          audioTrackId,
          workspaceId,
          noteId,
        })
        const belongedWorkspace = workspaceStore.getWorkspace({
          audioTrackId: otherNoteTarget.audioTrackId,
          workspaceId: otherNoteTarget.workspaceId,
        })
        const workspaceStartPosition = belongedWorkspace.startPosition
        const workspaceWidth = belongedWorkspace.width

        const newWidth = otherNoteTarget.width + noteWidthIncrement
        const absoluteNoteX = otherNoteTarget.relativeX + workspaceStartPosition
        const newAbsoluteRightEdgeX =
          absoluteNoteX + otherNoteTarget.width + rightEdgeXIncrement

        const absoluteRightEdgeXJudgement =
          newAbsoluteRightEdgeX > absoluteNoteX &&
          newAbsoluteRightEdgeX <= workspaceWidth + workspaceStartPosition

        if (!absoluteRightEdgeXJudgement) {
          reject(new Error("note element width exceeds workspace scope"))
        } else {
          resolve({
            updatedNoteTarget: otherNoteTarget,
            newWidth,
          })
        }
      })

      updateNoteRightEdgeArr.push(waitedUpdateNoteRightEdgeWork)
    }

    return Promise.all(updateNoteRightEdgeArr).then(
      (updateInfo) => {
        updateNoteTarget.width = newNoteWidth
        nextInsertedNoteWidth.value = newNoteWidth

        for (const { updatedNoteTarget, newWidth } of updateInfo) {
          updatedNoteTarget.width = newWidth
        }
      },
      (reason) => {
        return Promise.reject(reason)
      },
    )
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateNoteLeftEdge({
    editorId,
    id,
    selectedNotesId,
    audioTrackId,
    workspaceId,
    absoluteX,
    initRightEdgeX,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId,
    })
    const workspace = workspaceMap.get(workspaceId)
    const workspaceStartPosition = workspace.startPosition
    const noteItemsMap = workspace.noteItemsMap
    const updateNoteTarget = noteItemsMap.get(id)

    const scale = [workspaceStartPosition, initRightEdgeX]
    const oldRelativeX = updateNoteTarget.relativeX
    const oldNoteWidth = updateNoteTarget.width
    const newLeftEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: absoluteX,
      tickScale: scale,
    })
    const newRelativeX = newLeftEdgeX - workspaceStartPosition
    const newNoteWidth =
      initRightEdgeX - (newRelativeX + workspaceStartPosition)

    const relativeXIncrement = newRelativeX - oldRelativeX
    const noteWidthIncrement = newNoteWidth - oldNoteWidth
    const updateNoteLeftEdgeArr = []
    for (const [noteId, idsGroup] of selectedNotesId) {
      if (noteId === id) continue
      const { audioTrackId, workspaceId } = idsGroup
      const waitedUpdateNoteLeftWork = new Promise((resolve, reject) => {
        const otherNoteTarget = getSpecifiedNoteItem({
          audioTrackId,
          workspaceId,
          noteId,
        })
        const newWidth = otherNoteTarget.width + noteWidthIncrement
        const newRelativeX = otherNoteTarget.relativeX + relativeXIncrement

        const relativeXJudgement =
          newRelativeX >= 0 &&
          newRelativeX < otherNoteTarget.relativeX + otherNoteTarget.width
        if (!relativeXJudgement) {
          reject(new Error("note element width exceeds workspace scope"))
        } else {
          resolve({
            updatedNoteTarget: otherNoteTarget,
            newWidth,
            newRelativeX,
          })
        }
      })

      updateNoteLeftEdgeArr.push(waitedUpdateNoteLeftWork)
    }

    return Promise.all(updateNoteLeftEdgeArr).then(
      (updateInfo) => {
        updateNoteTarget.relativeX = newRelativeX
        updateNoteTarget.width = newNoteWidth
        nextInsertedNoteWidth.value = newNoteWidth

        for (const {
          updatedNoteTarget,
          newWidth,
          newRelativeX,
        } of updateInfo) {
          updatedNoteTarget.width = newWidth
          updatedNoteTarget.relativeX = newRelativeX
        }
      },
      (reason) => {
        return Promise.reject(reason)
      },
    )
  }

  function simulatePlaySpecifiedNote(pitchName, audioSignal) {
    if (!pitchName) return
    octaveContainerInstance.value?.dispatchEvent(
      new CustomEvent("play-sample", {
        detail: {
          pitchName,
          audioSignal,
        },
      }),
    )
  }

  function getSpecifiedNoteItemsMap({ audioTrackId, workspaceId }) {
    return workspaceStore.getWorkspace({ audioTrackId, workspaceId })
      ?.noteItemsMap
  }

  function getSpecifiedNoteItem({ audioTrackId, workspaceId, noteId }) {
    const noteItemsMap = getSpecifiedNoteItemsMap({ audioTrackId, workspaceId })
    return noteItemsMap?.get(noteId)
  }

  function getSelectedNoteAverageVelocity(noteIdSet) {
    const size = noteIdSet.size
    if (size === 0) return 0
    let velocityCount = 0
    for (const [noteId, idsGroup] of noteIdSet) {
      const { audioTrackId, workspaceId } = idsGroup
      const noteItem = getSpecifiedNoteItem({
        audioTrackId,
        workspaceId,
        noteId,
      })
      if (!noteItem) continue
      velocityCount += noteItem.velocity
    }
    return velocityCount / size
  }
  function updateNoteItemVelocity({
    velocity,
    noteIdSet,
    absoluteAdjustMode = true,
  }) {
    const averageVelocity = getSelectedNoteAverageVelocity(noteIdSet)
    for (const [noteId, idsGroup] of noteIdSet) {
      const { audioTrackId, workspaceId } = idsGroup
      const noteItem = getSpecifiedNoteItem({
        audioTrackId,
        workspaceId,
        noteId,
      })
      if (absoluteAdjustMode) {
        noteItem.velocity = clamp(velocity, VELOCITY_SCALE)
      } else {
        noteItem.velocity = clamp(
          noteItem.velocity + velocity - averageVelocity,
          VELOCITY_SCALE,
        )
      }
    }
  }

  function transposeNoteItem(noteIdSet, increment) {
    // 浮点数计算并不精确，但是范围判断是精确判断，在通过多次浮点数加减后，会导致相差1.0658141036401503e-14这种极其细微的误差
    const calculateErrorTolerance = 0.001
    const waitedTransposeNotesArr = []
    const _maxY = maxY.value
    const _pitchNameMappedToArea = pitchNameMappedToArea.value
    for (const [noteId, idsGroup] of noteIdSet) {
      const { audioTrackId, workspaceId } = idsGroup
      const transposedWork = new Promise((resolve, reject) => {
        const noteItem = getSpecifiedNoteItem({
          audioTrackId,
          workspaceId,
          noteId,
        })
        const newY = noteItem.y - increment * noteHeight.value
        const newPitchName = getInsertToSpecifiedPitchName({
          y: newY + calculateErrorTolerance,
          pitchNameMappedToArea: _pitchNameMappedToArea,
        })
        if (
          newY >= -calculateErrorTolerance &&
          newY <= _maxY + calculateErrorTolerance
        ) {
          resolve({
            noteItem,
            newY,
            newPitchName,
          })
        } else {
          reject()
        }
      })
      waitedTransposeNotesArr.push(transposedWork)
    }
    Promise.all(waitedTransposeNotesArr).then(
      (resolvedTransposedArr) => {
        for (const { noteItem, newY, newPitchName } of resolvedTransposedArr) {
          noteItem.y = newY
          noteItem.pitchName = newPitchName
        }
      },
      () => { },
    )
  }

  return {
    octaveContainerInstance,
    noteWidth,
    noteHeight,
    getSpecifiedNoteItemsMap,
    getSpecifiedNoteItem,
    createNoteItemsMap,
    getNoteItemTemplate,
    insertNoteItem,
    deleteNoteItem,
    updateNoteItemPosition,
    updateNoteLeftEdge,
    updateNoteRightEdge,
    simulatePlaySpecifiedNote,
    getSelectedNoteAverageVelocity,
    updateNoteItemVelocity,
    transposeNoteItem,
  }
})

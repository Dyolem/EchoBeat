import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  EDITOR_MODE_ENUM,
  TENSILE_ADSORPTION_GRID_THRESHOLD,
  NOTE_ELEMENT_SIZE,
  NOTE_ELEMENT_MIN_SIZE,
  ALIGN_TYPE_ENUM,
  MAIN_EDITOR_ID,
  SUBORDINATE_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { alignToGrid } from "@/utils/alignToGrid.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useNoteItemStore = defineStore("noteItem", () => {
  const zoomRatioStore = useZoomRatioStore()
  const editorGridParametersStore = useEditorGridParametersStore()
  const audioStore = useAudioStore()
  const mixTrackEditorStore = useMixTrackEditorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const workspaceStore = useWorkspaceStore()
  const beatControllerStore = useBeatControllerStore()

  const { baseWidth, baseHeight } = NOTE_ELEMENT_SIZE
  const { minWidth, minHeight } = NOTE_ELEMENT_MIN_SIZE

  const nextInsertedNoteWidth = ref(0)
  const noteWidth = computed(() => {
    return (
      nextInsertedNoteWidth.value ||
      baseWidth * editorGridParametersStore.trackZoomRatio
    )
  })
  const noteHeight = ref(baseHeight)

  const minGridWidth = ref(minWidth)
  const minGridHeight = ref(minHeight) //Temporarily out of use
  const stretchNoteWidthSnappedToGridThreshold = ref(
    TENSILE_ADSORPTION_GRID_THRESHOLD,
  )

  const CHROMATIC_SCALE_ENUM = ["1", "2", "3", "4", "5", "6", "7"]
  const CHROMATIC_PITCH_NAME_ENUM = ["C", "D", "E", "F", "G", "A", "B"]
  const NATURAL_SEMITONE = ["E", "B"]
  const isSnappedToHorizontalGrid = ref(true)
  const octaveContainerInstance = ref(null)
  const editorMode = ref(EDITOR_MODE_ENUM.SELECT)

  const isInsertMode = computed(
    () => editorMode.value === EDITOR_MODE_ENUM.INSERT,
  )
  const isSelectMode = computed(
    () => editorMode.value === EDITOR_MODE_ENUM.SELECT,
  )
  const isVelocityMode = computed(
    () => editorMode.value === EDITOR_MODE_ENUM.VELOCITY,
  )
  const pitchNameMappedToArea = computed(() => {
    const _toFixed = (val, num = 2) => {
      return Number(val.toFixed(num))
    }
    const pitchNameMappedToAreaArr = []
    let count = 0
    for (const chromaticScale of CHROMATIC_SCALE_ENUM.toReversed()) {
      for (const chromaticPitchName of CHROMATIC_PITCH_NAME_ENUM.toReversed()) {
        if (!NATURAL_SEMITONE.includes(chromaticPitchName)) {
          pitchNameMappedToAreaArr.push({
            pitchName: chromaticPitchName + "#" + chromaticScale,
            scale: [
              _toFixed(count * noteHeight.value),
              _toFixed((count + 1) * noteHeight.value),
            ],
          })
          count++
        }
        pitchNameMappedToAreaArr.push({
          pitchName: chromaticPitchName + chromaticScale,
          scale: [
            _toFixed(count * noteHeight.value),
            _toFixed((count + 1) * noteHeight.value),
          ],
        })
        count++
      }
    }
    return pitchNameMappedToAreaArr
  })

  /**
   * @typedef {[number, number]} ScaleYTuple - 垂直缩放比例范围元组 [最小值, 最大值]
   */

  /**
   * @typedef {string} PitchNameId - 以音名作为Map的键，同时具有id的作用
   */

  /**
   * @typedef {Object} PitchAreaElement
   * @property {PitchNameId} pitchName - 音高名称（如 "c4"）
   * @property {ScaleYTuple} scale - 垂直高度范围
   */

  /**
   * @typedef {Object} NoteItem
   * @property {PitchNameId} pitchName - 音高名称（与Map键严格一致）
   * @property {string} id - note元素自身id
   * @property {string} width - note元素的宽度
   * @property {string} height - note元素的高度
   * @property {string} x - note元素相对于midi编辑器左上角原点的绝对横坐标
   * @property {string} y - note元素相对于midi编辑器左上角原点的绝对纵坐标
   * @property {number} startTime - 以0时刻为起点的时间参考系，note元素的起始播放时刻
   * @property {number} duration - 以0时刻为起点的时间参考系，note元素的播放持续时间
   */
  /**
   * @typedef {Object} NoteTrack
   * @property {PitchNameId} pitchName - 音高名称（与Map键严格一致）
   * @property {ScaleYTuple} scaleY - 垂直高度范围
   * @property {NoteItem[]} noteItems - 音符项集合（初始化为空数组）
   */

  /**
   * 创建音符轨道映射表
   * @returns {Map<PitchNameId, NoteTrack>}
   * @param {import('vue').computed<PitchAreaElement[]>} _pitchNameMappedToArea - 响应式音域配置源
   */
  function createNoteItemsMap(
    _pitchNameMappedToArea = pitchNameMappedToArea.value,
  ) {
    /** @type {Map<PitchNameId, NoteTrack>} */
    const noteItemsMap = new Map()

    noteItemsMap.clear()

    // 类型安全的遍历处理
    for (const pitchNameMappedToAreaElement of _pitchNameMappedToArea) {
      /** @type {PitchAreaElement} */
      const { pitchName, scale } = pitchNameMappedToAreaElement

      /** @type {NoteTrack} */
      const template = {
        pitchName,
        scaleY: scale, // 自动匹配ScaleYTuple类型
        noteItems: [], // 初始化空数组
      }

      // 这里会检查键类型与pitchName类型的一致性
      noteItemsMap.set(pitchName, template)
    }

    return noteItemsMap
  }

  function getInsertToSpecifiedPitchName({ x, y } = {}, pitchNameMappedToArea) {
    if (x === undefined || y === undefined) return
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

  function getId(insertToSpecifiedPitchName, noteItemsMap) {
    if (insertToSpecifiedPitchName === undefined || noteItemsMap === undefined)
      return
    const count = noteItemsMap.get(insertToSpecifiedPitchName).noteItems.length
    const date = new Date()
    const fetchTime = date.getTime()
    return `${insertToSpecifiedPitchName}-${count}-${fetchTime}`
  }

  function getLegalNoteStartPositionAndWidthInWorkspace(
    { noteHorizontalStartPosition, noteWidth },
    workspace,
  ) {
    const { startPosition, width: workspaceWidth } = workspace
    const legalNoteStartPosition =
      Math.min(
        Math.max(noteHorizontalStartPosition, startPosition) + noteWidth,
        workspace.startPosition + workspaceWidth,
      ) - noteWidth
    const maxNoteWidth = startPosition + workspaceWidth - legalNoteStartPosition
    const legalNoteWidth = Math.min(maxNoteWidth, noteWidth)
    return {
      legalNoteStartPosition,
      legalNoteWidth,
    }
  }

  function noteItemTemplate({
    x,
    y,
    insertToSpecifiedPitchName,
    workspaceId,
    audioTrackId,
  }) {
    const newWorkspace = workspaceStore.getWorkspace({
      workspaceId,
      audioTrackId,
    })
    const id = getId(insertToSpecifiedPitchName, newWorkspace.noteItemsMap)

    const { snappedPosition, snappedPitchName } = snapToOtherPitchNameTrack({
      notePosition: {
        x,
        y,
      },
      noteItemsMap: newWorkspace.noteItemsMap,
    })
    const { snappedX, snappedY } = snappedPosition
    const { legalNoteStartPosition, legalNoteWidth } =
      getLegalNoteStartPositionAndWidthInWorkspace(
        {
          noteHorizontalStartPosition: snappedX,
          noteWidth: noteWidth.value,
        },
        newWorkspace,
      )
    const relativeX = legalNoteStartPosition - newWorkspace.startPosition
    return {
      id: id,
      workspaceId,
      audioTrackId,
      width: legalNoteWidth,
      height: noteHeight.value,
      get x() {
        return this.relativeX + this.workspaceStartPosition
      },
      relativeX,
      y: snappedY,
      get workspaceStartPosition() {
        return workspaceStore.getWorkspace({
          audioTrackId: this.audioTrackId,
          workspaceId: this.workspaceId,
        }).startPosition
      },
      pitchName: snappedPitchName,
      get startTime() {
        return (
          (this.x / beatControllerStore.totalLength(SUBORDINATE_EDITOR_ID)) *
          beatControllerStore.editableTotalTime
        )
      },
      get duration() {
        return (
          (this.width /
            beatControllerStore.totalLength(SUBORDINATE_EDITOR_ID)) *
          beatControllerStore.editableTotalTime
        )
      },
    }
  }

  function insertNoteItem(
    { audioTrackId, x, y, insertToSpecifiedPitchName } = {},
    returnInsertedItemFullInfo = false,
  ) {
    if (x === undefined || y === undefined || !audioTrackId) return

    const specifiedPitchName =
      insertToSpecifiedPitchName ??
      getInsertToSpecifiedPitchName({ x, y }, pitchNameMappedToArea.value)

    const { workspace, isCreated } = workspaceStore.shallCreateWorkspace({
      audioTrackId,
      startPosition: x,
    })
    const dataConvert = (value) => {
      return zoomRatioStore.convertDataBetweenEditors({
        fromValue: value,
        fromZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(
          SUBORDINATE_EDITOR_ID,
        ),
        toZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(MAIN_EDITOR_ID),
      })
    }
    const { width, workspaceBadgeName, startPosition, id } = workspace
    const noteItemsMap = workspace.noteItemsMap
    if (isCreated) {
      const subTrackItemId = mixTrackEditorStore.createSubTrackItem({
        audioTrackId,
        workspaceId: id,
        trackItemWidth: dataConvert(width),
        startPosition: dataConvert(startPosition),
        trackName: workspaceBadgeName,
      })
      workspaceStore.getWorkspace({
        audioTrackId,
        workspaceId: id,
      }).subTrackItemId = subTrackItemId
    } else {
      mixTrackEditorStore.updateRightEdge({
        editorId: SUBORDINATE_EDITOR_ID,
        audioTrackId: audioTrackId,
        subTrackItemId: workspace.subTrackItemId,
        x: startPosition + width,
        initLeftEdgeX: startPosition,
      })
    }

    const template = noteItemTemplate({
      x,
      y,
      insertToSpecifiedPitchName: specifiedPitchName,
      workspaceId: id,
      audioTrackId,
    })
    const noteItems = noteItemsMap.get(specifiedPitchName)?.noteItems
    noteItems?.push(template)
    console.log(template)
    audioStore.insertSourceNodeAndGainNode(template)
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
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const noteItemsMap = workspaceMap.get(workspaceId).noteItemsMap
    const deleteTargetArr = noteItemsMap.get(
      deleteFromSpecifiedPitchName,
    ).noteItems
    if (!deleteTargetArr) return

    const deleteIndex = deleteTargetArr.findIndex((item) => item.id === id)
    if (deleteIndex === -1) return
    deleteTargetArr.splice(deleteIndex, 1)
    audioStore.removeNodeFromPitchName(id, deleteFromSpecifiedPitchName)
  }
  function leftJustifyingGrid(x) {
    return (
      Math.floor(x / editorGridParametersStore.minGridHorizontalMovement) *
      editorGridParametersStore.minGridHorizontalMovement
    )
  }
  function topJustifyingGrid(y) {
    return (
      Math.floor(y / editorGridParametersStore.minGridVerticalMovement) *
      editorGridParametersStore.minGridVerticalMovement
    )
  }
  function snapToOtherPitchNameTrack({
    notePosition,
    mousedownPositionInNote = [],
    noteItemsMap,
  }) {
    const { x, y } = notePosition
    const expectedInsertToPitchName = getInsertToSpecifiedPitchName(
      { x, y },
      pitchNameMappedToArea.value,
    )
    let snappedX = 0
    let snappedY = 0
    if (mousedownPositionInNote.length === 0) {
      //insert logic
      snappedY = noteItemsMap.get(expectedInsertToPitchName)?.scaleY[0]
      snappedX = alignToGrid(x, {
        gridSize: beatControllerStore.factualDisplayedGridWidth(
          SUBORDINATE_EDITOR_ID,
        ),
        alignType: ALIGN_TYPE_ENUM.LEFT_JUSTIFYING,
      })
    } else {
      //update logic
      const [mousedownXInNote, mousedownYInNote] = mousedownPositionInNote

      /*
       * const snappedX = Math.floor((x - mousedownXInNote) / minGridWidth.value) * minGridWidth.value
       * 根据算法，吸附网格的原理是移动位置x是网格值的整数倍时，更新一次x值，
       * 由于note元素自身有宽度，光标位置在元素内部，并不是元素的左上角，所以需要减去mousedownXInNote的值
       * 但这样导致一个问题：假设网格值为20，note位于(20,0)，宽度为20,光标相对于note元素的点击位置为(3，0)，相对于noteRegion元素的点击位置为(23，0)
       * 现在往右拖动17px，此时相对于note元素的点击位置为(20，0)，相对于noteRegion元素的点击位置为(40，0)
       * 此时40已经是网格值的20整数倍，所以需要进行一次移动，根据计算：Math.floor((40-3)/20)*20=20，可以发现note并不会移动，
       * 可以看出相对于noteRegion元素的点击位置为要大于等于43时才能让note移动，此后的移动阈值需要x满足63，83...
       * 这就违反了移动位置x是网格值的整数倍时的规则，而bug的产生原因在于减去的mousedownXInNote值，被提前进行了取整。
       * 然而减去mousedownXInNote的值是必须，因此可以单独对mousedownXInNote值进行取整，然后将取整的两个值相减。
       * */
      snappedX =
        alignToGrid(x, {
          gridSize: editorGridParametersStore.minGridHorizontalMovement,
          alignType: ALIGN_TYPE_ENUM.LEFT_JUSTIFYING,
        }) -
        alignToGrid(mousedownXInNote, {
          gridSize: editorGridParametersStore.minGridHorizontalMovement,
          alignType: ALIGN_TYPE_ENUM.LEFT_JUSTIFYING,
        })
      snappedY =
        alignToGrid(y, {
          gridSize: editorGridParametersStore.minGridVerticalMovement,
          alignType: ALIGN_TYPE_ENUM.TOP_JUSTIFYING,
        }) -
        alignToGrid(mousedownYInNote, {
          gridSize: editorGridParametersStore.minGridVerticalMovement,
          alignType: ALIGN_TYPE_ENUM.TOP_JUSTIFYING,
        })
    }
    return {
      snappedPosition: {
        snappedX,
        snappedY,
      },
      snappedPitchName: expectedInsertToPitchName,
    }
  }

  function updateNoteItemPosition({
    id,
    audioTrackId,
    workspaceId,
    pitchName,
    position,
    mousedownPositionInNote,
  }) {
    const isCoordinateAxisArray = (arr) => {
      return Array.isArray(arr) && arr.length === 2
    }
    if (
      id === undefined ||
      audioTrackId === undefined ||
      workspaceId === undefined ||
      pitchName === undefined ||
      !isCoordinateAxisArray(position) ||
      !isCoordinateAxisArray(mousedownPositionInNote)
    )
      return

    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const noteItemsMap = workspace.noteItemsMap

    const updateNoteTarget = noteItemsMap
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
    if (updateNoteTarget === undefined) return

    const [x, y] = position
    const [mousedownXInNote] = mousedownPositionInNote
    const { snappedPosition, snappedPitchName } = snapToOtherPitchNameTrack({
      notePosition: { x, y },
      mousedownPositionInNote,
      noteItemsMap,
    })
    const { snappedX, snappedY } = snappedPosition
    if (isSnappedToHorizontalGrid.value) {
      const { legalNoteStartPosition } =
        getLegalNoteStartPositionAndWidthInWorkspace(
          {
            noteHorizontalStartPosition: snappedX,
            noteWidth: updateNoteTarget.width,
          },
          workspace,
        )
      updateNoteTarget.relativeX =
        legalNoteStartPosition - workspace.startPosition
    } else {
      const { legalNoteStartPosition } =
        getLegalNoteStartPositionAndWidthInWorkspace(
          {
            noteHorizontalStartPosition: x - mousedownXInNote,
            noteWidth: updateNoteTarget.width,
          },
          workspace,
        )
      updateNoteTarget.relativeX =
        legalNoteStartPosition - workspace.startPosition
    }
    updateNoteTarget.y = snappedY
    updateNoteTarget.pitchName = snappedPitchName
    const newNoteId = getId(snappedPitchName, noteItemsMap)
    return {
      newNoteId,
      newPitchName: snappedPitchName,
    }
  }

  function updateNoteItemsMap({
    oldId,
    newId,
    audioTrackId,
    workspaceId,
    oldPitchName,
    newPitchName,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const noteItemsMap = workspaceMap.get(workspaceId).noteItemsMap
    const oldTargetArr = noteItemsMap.get(oldPitchName).noteItems
    const newTargetArr = noteItemsMap.get(newPitchName).noteItems
    const oldTargetIndex = oldTargetArr.findIndex((item) => {
      return item.id === oldId
    })
    const newStartTime = oldTargetArr[oldTargetIndex].startTime
    const newDuration = oldTargetArr[oldTargetIndex].duration
    oldTargetArr[oldTargetIndex].id = newId
    newTargetArr.push(oldTargetArr[oldTargetIndex])
    oldTargetArr.splice(oldTargetIndex, 1)

    audioStore.adjustNodeStartAndLastTime({
      id: oldId,
      newId,
      pitchName: newPitchName,
      startTime: newStartTime,
      duration: newDuration,
    })
  }

  function stretchNoteWidth({
    id,
    audioTrackId,
    workspaceId,
    pitchName,
    stretchXLength,
    initWidth,
    mousedownStartX,
    initX,
  }) {
    if (
      id === undefined ||
      audioTrackId === undefined ||
      workspaceId === undefined ||
      pitchName === undefined ||
      stretchXLength === undefined ||
      initWidth === undefined ||
      initX === undefined ||
      mousedownStartX === undefined
    )
      return
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const noteItemsMap = workspace.noteItemsMap
    const updateNoteTarget = noteItemsMap
      .get(pitchName)
      .noteItems.find((item) => item.id === id)

    if (updateNoteTarget === undefined) return
    let newWidth = 0
    let newX = 0
    const middlePoint = initWidth / 2

    if (mousedownStartX - initX < middlePoint) {
      //left side drag
      newWidth = initWidth - stretchXLength
      newX = initX + stretchXLength

      /*
       * If the stretched values of the coordinates of the left
       * and right borders of the note element are within the threshold (3px)
       * and the minimum moving grid distance, the adsorption is triggered
       * */
      if (isSnappedToHorizontalGrid.value) {
        let restMovement =
          newX % editorGridParametersStore.minGridHorizontalMovement
        if (
          restMovement <
          editorGridParametersStore.minGridHorizontalMovement / 2
        ) {
          //When stretched from right to left, it attaches to the left
          if (restMovement <= stretchNoteWidthSnappedToGridThreshold.value) {
            newX -= restMovement
            newWidth += restMovement
          }
        } else {
          //When stretched from left to right, it attaches to the right
          restMovement =
            editorGridParametersStore.minGridHorizontalMovement - restMovement
          if (restMovement <= stretchNoteWidthSnappedToGridThreshold.value) {
            newX += restMovement
            newWidth -= restMovement
          }
        }
      }

      const maxWidth = initX + initWidth - workspace.startPosition
      if (newWidth < minGridWidth.value || newWidth > maxWidth) return

      updateNoteTarget.relativeX = newX - workspace.startPosition
      updateNoteTarget.width = newWidth
      nextInsertedNoteWidth.value = newWidth
      const newStartTime = updateNoteTarget.startTime
      const newDuration = updateNoteTarget.duration
      audioStore.adjustNodeStartAndLastTime({
        id,
        pitchName,
        startTime: newStartTime,
        duration: newDuration,
      })
    } else {
      //right side drag
      const maxWidth = workspace.startPosition + workspace.width - initX
      newWidth = initWidth + stretchXLength

      /*
       * If the stretched values of the coordinates of the left
       * and right borders of the note element are within the threshold (3px)
       * and the minimum moving grid distance, the adsorption is triggered
       * */
      if (isSnappedToHorizontalGrid.value) {
        //noteRightSidePositionX: note元素右边界的translateX值
        const noteRightSidePositionX = updateNoteTarget.x + newWidth
        let restMovement =
          noteRightSidePositionX %
          editorGridParametersStore.minGridHorizontalMovement
        if (
          restMovement <
          editorGridParametersStore.minGridHorizontalMovement / 2
        ) {
          //When stretched from right to left, it attaches to the left
          if (restMovement <= stretchNoteWidthSnappedToGridThreshold.value) {
            newWidth -= restMovement
          }
        } else {
          //When stretched from left to right, it attaches to the right
          restMovement =
            editorGridParametersStore.minGridHorizontalMovement - restMovement
          if (restMovement <= stretchNoteWidthSnappedToGridThreshold.value) {
            newWidth += restMovement
          }
        }
      }

      if (newWidth < minGridWidth.value || newWidth > maxWidth) return
      updateNoteTarget.width = newWidth
      nextInsertedNoteWidth.value = newWidth
      const newStartTime = updateNoteTarget.startTime
      const newDuration = updateNoteTarget.duration
      console.log("right")
      audioStore.adjustNodeStartAndLastTime({
        id,
        startTime: newStartTime,
        duration: newDuration,
        pitchName,
      })
    }
  }
  function passivePatchUpdateNoteItemsWithZoomRatio({
    audioTrackId,
    newTrackZoomRatio,
    oldTrackZoomRatio,
  }) {
    if (
      audioTrackId === undefined ||
      newTrackZoomRatio === oldTrackZoomRatio ||
      newTrackZoomRatio === undefined ||
      oldTrackZoomRatio === undefined
    )
      return
    editorGridParametersStore.trackZoomRatio = newTrackZoomRatio
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    for (const { noteItemsMap } of workspaceMap.values()) {
      noteItemsMap.forEach((pitchNameObj) => {
        pitchNameObj.noteItems.forEach((noteItem) => {
          noteItem.width =
            (noteItem.width / oldTrackZoomRatio) * newTrackZoomRatio
        })
      })
    }
  }
  function simulatePlaySpecifiedNote(pitchName) {
    octaveContainerInstance.value?.dispatchEvent(
      new CustomEvent("play-sample", {
        detail: {
          pitchName,
        },
      }),
    )
  }
  return {
    octaveContainerInstance,
    editorMode,
    isInsertMode,
    isSelectMode,
    isVelocityMode,
    isSnappedToHorizontalGrid,
    leftJustifyingGrid,
    topJustifyingGrid,
    noteWidth,
    noteHeight,
    createNoteItemsMap,
    insertNoteItem,
    deleteNoteItem,
    updateNoteItemPosition,
    updateNoteItemsMap,
    stretchNoteWidth,
    passivePatchUpdateNoteItemsWithZoomRatio,
    simulatePlaySpecifiedNote,
  }
})

// new Map([
//   [
//     "c4",
//     {
//       pitchName: "c4",
//       scaleY: [20,40],
//       noteItems: [
//         {
//           pitchName:"c4",
//           id: "c4-1",
//           width: 20,
//           height: 10,
//           x: 10,
//           y: 20,
//           backGroundColor: "lightblue",
//           startTime,
//           duration,
//         },
//         {
//           id: "c4-2",
//           width: 20,
//           height: 10,
//           x: 40,
//           y: 60,
//           backGroundColor: "lightblue",
//           backGroundColor: "lightblue",
//           startTime,
//           duration,
//         },
//       ],
//     },
//   ],
//   [
//     "c5",
//     {
//       pitchName: "c5",
//       scaleY: [80,100],
//       noteItems: [
//         {
//           id: "c5-1",
//           width: 20,
//           height: 10,
//           x: 10,
//           y: 20,
//           backGroundColor: "lightblue",
//         },
//         {
//           id: "c5-2",
//           width: 20,
//           height: 10,
//           x: 40,
//           y: 60,
//           backGroundColor: "lightblue",
//         },
//       ],
//     },
//   ],
// ]),

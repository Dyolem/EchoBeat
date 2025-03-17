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
} from "@/constants/daw/index.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
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
  const audioStore = useAudioStore()
  const mixTrackEditorStore = useMixTrackEditorStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const workspaceStore = useWorkspaceStore()
  const beatControllerStore = useBeatControllerStore()
  const pianoKeySizeStore = usePianoKeySizeStore()

  const absoluteTimePerTick = computed(() => {
    return beatControllerStore.absoluteTimePerTick
  })

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
    const _toFixed = (val, num = 2) => {
      return Number(val.toFixed(num))
    }
    const pitchNameMappedToAreaArr = []
    let count = 0
    for (const chromaticScale of CHROMATIC_SCALE_SERIAL_NUMBER.toReversed()) {
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

  function getId(insertToSpecifiedPitchName, noteItemsMap) {
    if (insertToSpecifiedPitchName === undefined || noteItemsMap === undefined)
      return
    const count = noteItemsMap.get(insertToSpecifiedPitchName).noteItems.length
    const date = new Date()
    const fetchTime = date.getTime()
    return `${insertToSpecifiedPitchName}-${count}-${fetchTime}`
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
    const id = getId(insertToSpecifiedPitchName, newWorkspace.noteItemsMap)
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
      get x() {
        return this.relativeX + this.workspaceStartPosition
      },
      relativeX,
      y: computedY,
      get workspaceStartPosition() {
        return workspaceStore.getWorkspace({
          audioTrackId: this.audioTrackId,
          workspaceId: this.workspaceId,
        }).startPosition
      },
      pitchName: pitchName,
      get startTime() {
        return this.x * absoluteTimePerTick.value
      },
      get duration() {
        return this.width * absoluteTimePerTick.value
      },
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
    audioStore.removeNodeFromNoteId({ audioTrackId, id })
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
    audioTrackId,
    workspaceId,
    pitchName,
    x,
    y,
  }) {
    if (
      id === undefined ||
      audioTrackId === undefined ||
      workspaceId === undefined ||
      pitchName === undefined ||
      x === undefined ||
      y === undefined
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

    const scaleX = [
      workspace.startPosition,
      workspace.startPosition + workspace.width - updateNoteTarget.width,
    ]
    const scaleY = [0, maxY.value]
    const { alignedAbsolutePosition, alignedPitchName } =
      alignToOtherPitchNameTrack({
        absolutePosition: [x, y],
        scale: [scaleX, scaleY],
      })
    if (!alignedPitchName) return
    const [tickAlignedAbsoluteX, alignedAbsoluteY] = alignedAbsolutePosition
    updateNoteTarget.relativeX = tickAlignedAbsoluteX - workspace.startPosition
    updateNoteTarget.y = alignedAbsoluteY

    updateNoteTarget.pitchName = alignedPitchName
    const newNoteId = getId(alignedPitchName, noteItemsMap)
    return {
      newNoteId,
      newPitchName: alignedPitchName,
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
    oldTargetArr[oldTargetIndex].id = newId
    newTargetArr.push(oldTargetArr[oldTargetIndex])
    oldTargetArr.splice(oldTargetIndex, 1)
    audioStore.updateSpecifiedNoteBufferSourceMap({
      audioTrackId,
      newId,
      oldId,
    })
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateNoteRightEdge({
    editorId,
    id,
    audioTrackId,
    workspaceId,
    pitchName,
    absoluteX,
    initLeftEdgeX,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const noteItemsMap = workspace.noteItemsMap
    const updateNoteTarget = noteItemsMap
      .get(pitchName)
      .noteItems.find((item) => item.id === id)

    const scale = [initLeftEdgeX, workspace.width + workspace.startPosition]
    const newRightEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: absoluteX,
      tickScale: scale,
    })
    const newNoteWidth = newRightEdgeX - initLeftEdgeX
    updateNoteTarget.width = newNoteWidth
    nextInsertedNoteWidth.value = newNoteWidth
  }

  /**
   * 传入参数中的长度值和函数返回值均为tick单位
   */
  function updateNoteLeftEdge({
    editorId,
    id,
    audioTrackId,
    workspaceId,
    pitchName,
    absoluteX,
    initRightEdgeX,
  }) {
    const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    })
    const workspace = workspaceMap.get(workspaceId)
    const workspaceStartPosition = workspace.startPosition
    const noteItemsMap = workspace.noteItemsMap
    const updateNoteTarget = noteItemsMap
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
    const scale = [workspaceStartPosition, initRightEdgeX]
    const newLeftEdgeX = snapToTickUnitGrid({
      editorId,
      tickX: absoluteX,
      tickScale: scale,
    })
    const newRelativeX = newLeftEdgeX - workspaceStartPosition
    updateNoteTarget.relativeX = newRelativeX
    const newNoteWidth =
      initRightEdgeX - (newRelativeX + workspaceStartPosition)
    updateNoteTarget.width = newNoteWidth
    nextInsertedNoteWidth.value = newNoteWidth
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
  return {
    octaveContainerInstance,
    noteWidth,
    noteHeight,
    createNoteItemsMap,
    getNoteItemTemplate,
    insertNoteItem,
    deleteNoteItem,
    updateNoteItemPosition,
    updateNoteItemsMap,
    updateNoteLeftEdge,
    updateNoteRightEdge,
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

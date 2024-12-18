import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import {
  EDITOR_MODE_ENUM,
  TENSILE_ADSORPTION_GRID_THRESHOLD,
  NOTE_ELEMENT_SIZE,
  NOTE_ELEMENT_MIN_SIZE,
} from "@/constants/daw/index.js"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"

export const useNoteItemStore = defineStore("noteItem", () => {
  const editorGridParametersStore = useEditorGridParametersStore()
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

  const initNoteItemsMap = computed(() => {
    const noteItemsMap = new Map()
    noteItemsMap.clear()
    for (const pitchNameMappedToAreaElement of pitchNameMappedToArea.value) {
      const { pitchName, scale } = pitchNameMappedToAreaElement
      const template = { pitchName, scaleY: scale, noteItems: [] }
      noteItemsMap.set(pitchName, template)
    }
    return noteItemsMap
  })
  const noteItemsMap = ref(initNoteItemsMap.value)
  watch(initNoteItemsMap, (newVal) => {
    noteItemsMap.value = newVal
  })
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

  function noteItemTemplate({ x, y } = {}, insertToSpecifiedPitchName) {
    const count = noteItemsMap.value.get(insertToSpecifiedPitchName).noteItems
      .length
    const [snappedX, snappedY] = snapToOtherPitchNameTrack({ x, y })

    return {
      id: `${insertToSpecifiedPitchName}-${count}`,
      width: noteWidth.value,
      height: noteHeight.value,
      x: snappedX,
      y: snappedY,
      backGroundColor: "lightblue",
    }
  }
  const getSpecifiedNote = (id, pitchName) => {
    return noteItemsMap.value
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
  }
  function isExistNoteItem(
    { x, y } = {},
    isSnappedToHorizontalGrid,
    insertToSpecifiedPitchName = getInsertToSpecifiedPitchName(
      { x, y },
      pitchNameMappedToArea.value,
    ),
  ) {
    if (x === undefined || y === undefined) return
    const noteItems = noteItemsMap.value.get(
      insertToSpecifiedPitchName,
    ).noteItems
    return (
      noteItems.find((item) => {
        const { x: itemX, y: itemY } = item
        if (isSnappedToHorizontalGrid) {
          if (x - itemX >= 0 && x - itemX < minGridWidth.value) {
            return true
          }
        } else {
          if (x === itemX && y === itemY) {
            return true
          }
        }
      }) ?? false
    )
  }
  function insertNoteItem(
    { x, y } = {},
    insertToSpecifiedPitchName = getInsertToSpecifiedPitchName(
      { x, y },
      pitchNameMappedToArea.value,
    ),
  ) {
    if (x === undefined || y === undefined) return
    const template = noteItemTemplate({ x, y }, insertToSpecifiedPitchName)
    noteItemsMap.value.get(insertToSpecifiedPitchName)?.noteItems.push(template)

    return template.id
  }

  function deleteNoteItem(id, deleteFromSpecifiedPitchName) {
    if (id === undefined || deleteFromSpecifiedPitchName === undefined) return

    const deleteTargetArr = noteItemsMap.value.get(
      deleteFromSpecifiedPitchName,
    ).noteItems
    if (!deleteTargetArr) return

    const deleteIndex = deleteTargetArr.findIndex((item) => item.id === id)
    if (deleteIndex === -1) return
    deleteTargetArr.splice(deleteIndex, 1)
  }

  function snapToOtherPitchNameTrack({ x, y }, mousedownPositionInNote = []) {
    const expectedInsertToPitchName = getInsertToSpecifiedPitchName(
      { x, y },
      pitchNameMappedToArea.value,
    )

    if (mousedownPositionInNote.length === 0) {
      //insert logic
      const snappedY = noteItemsMap.value.get(expectedInsertToPitchName)
        ?.scaleY[0]
      const snappedX =
        Math.floor(x / editorGridParametersStore.minGridHorizontalMovement) *
        editorGridParametersStore.minGridHorizontalMovement
      return [snappedX, snappedY]
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
      const snappedX =
        Math.floor(x / editorGridParametersStore.minGridHorizontalMovement) *
          editorGridParametersStore.minGridHorizontalMovement -
        Math.floor(
          mousedownXInNote /
            editorGridParametersStore.minGridHorizontalMovement,
        ) *
          editorGridParametersStore.minGridHorizontalMovement
      const snappedY =
        Math.floor(y / editorGridParametersStore.minGridVerticalMovement) *
          editorGridParametersStore.minGridVerticalMovement -
        Math.floor(
          mousedownYInNote / editorGridParametersStore.minGridVerticalMovement,
        ) *
          editorGridParametersStore.minGridVerticalMovement

      return [snappedX, snappedY]
    }
  }

  function updateNoteItemPosition(
    id,
    pitchName,
    position,
    mousedownPositionInNote,
  ) {
    if (id === undefined || pitchName === undefined || position.length !== 2)
      return
    const updateNoteTarget = noteItemsMap.value
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
    if (updateNoteTarget === undefined) return

    const [x, y] = position
    const [mousedownXInNote] = mousedownPositionInNote
    const [snappedX, snappedY] = snapToOtherPitchNameTrack(
      { x, y },
      mousedownPositionInNote,
    )
    if (isSnappedToHorizontalGrid.value) {
      updateNoteTarget.x = snappedX
    } else {
      updateNoteTarget.x = x - mousedownXInNote
    }
    updateNoteTarget.y = snappedY
  }

  function stretchNoteWidth({
    id,
    pitchName,
    stretchXLength,
    initWidth,
    mousedownStartX,
    initX,
    maxMovementRegionWidth,
  }) {
    if (
      id === undefined ||
      pitchName === undefined ||
      stretchXLength === undefined ||
      initWidth === undefined ||
      initX === undefined ||
      mousedownStartX === undefined ||
      maxMovementRegionWidth === undefined
    )
      return

    const updateNoteTarget = noteItemsMap.value
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

      const maxWidth = initX + initWidth
      if (newWidth < minGridWidth.value || newWidth > maxWidth) return
      updateNoteTarget.x = newX
      updateNoteTarget.width = newWidth
      nextInsertedNoteWidth.value = newWidth
    } else {
      //right side drag
      const maxWidth = maxMovementRegionWidth - initX
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
    }
  }
  function patchUpdateNoteItems(newTrackZoomRatio, oldTrackZoomRatio) {
    if (
      newTrackZoomRatio === oldTrackZoomRatio ||
      newTrackZoomRatio === undefined ||
      oldTrackZoomRatio === undefined
    )
      return

    noteItemsMap.value.forEach((pitchNameObj, pitchName) => {
      pitchNameObj.noteItems.forEach((noteItem) => {
        noteItem.x = (noteItem.x / oldTrackZoomRatio) * newTrackZoomRatio
        noteItem.width =
          (noteItem.width / oldTrackZoomRatio) * newTrackZoomRatio
      })
    })
  }
  return {
    editorMode,
    isInsertMode,
    isSelectMode,
    isVelocityMode,
    isSnappedToHorizontalGrid,
    noteHeight,
    noteItemsMap,
    insertNoteItem,
    deleteNoteItem,
    isExistNoteItem,
    updateNoteItemPosition,
    stretchNoteWidth,
    patchUpdateNoteItems,
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
//           id: "c4-1",
//           width: 20,
//           height: 10,
//           x: 10,
//           y: 20,
//           backGroundColor: "lightblue",
//         },
//         {
//           id: "c4-2",
//           width: 20,
//           height: 10,
//           x: 40,
//           y: 60,
//           backGroundColor: "lightblue",
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

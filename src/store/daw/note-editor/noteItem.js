import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import { EDITOR_MODE_ENUM } from "@/constants/daw/index.js"

export const useNoteItemStore = defineStore("noteItem", () => {
  const noteHeight = ref(10)
  const minGridWidth = ref(20)
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
    const _toFixed = (val, num = 1) => {
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
    const [snappedX, snappedY] = snapToOtherPitchNameTrack(
      { x, y },
      insertToSpecifiedPitchName,
    )

    return {
      id: `${insertToSpecifiedPitchName}-${count}`,
      width: 20,
      height: 10,
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

  function snapToOtherPitchNameTrack(
    { x, y },
    expectedInsertToPitchName = getInsertToSpecifiedPitchName(
      { x, y },
      pitchNameMappedToArea.value,
    ),
  ) {
    const snappedY = noteItemsMap.value.get(expectedInsertToPitchName)
      ?.scaleY[0]
    const snappedX = Math.floor(x / minGridWidth.value) * minGridWidth.value

    return [snappedX, snappedY]
  }

  function updateNoteItemPosition(id, pitchName, position) {
    if (id === undefined || pitchName === undefined || position.length !== 2)
      return
    const updateNoteTarget = noteItemsMap.value
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
    if (updateNoteTarget === undefined) return

    const [x, y] = position
    const [snappedX, snappedY] = snapToOtherPitchNameTrack({ x, y })
    if (isSnappedToHorizontalGrid.value) {
      updateNoteTarget.x = snappedX
    } else {
      updateNoteTarget.x = x
    }
    updateNoteTarget.y = snappedY
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

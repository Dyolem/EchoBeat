import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"

export const useNoteItemStore = defineStore("noteItem", () => {
  const noteHeight = ref(10)
  const CHROMATIC_SCALE_ENUM = ["1", "2", "3", "4", "5", "6", "7"]
  const CHROMATIC_PITCH_NAME_ENUM = ["C", "D", "E", "F", "G", "A", "B"]
  const NATURAL_SEMITONE = ["E", "B"]
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
    const [insertStartY, insertEndY] = noteItemsMap.value.get(
      insertToSpecifiedPitchName,
    ).scaleY
    // console.log(
    //   { x, y },
    //   insertToSpecifiedPitchName,
    //   pitchNameMappedToArea.value,
    //   noteItemsMap.value,
    //   insertStartY,
    // )
    return {
      id: `${insertToSpecifiedPitchName}-${count}`,
      width: 20,
      height: 10,
      x: x,
      y: insertStartY,
      backGroundColor: "lightblue",
    }
  }
  const getSpecifiedNote = (id, pitchName) => {
    return noteItemsMap.value
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
  }
  function insertNoteItem({ x, y } = {}, insertToSpecifiedPitchName) {
    if (x === undefined || y === undefined) return

    const pitchName =
      insertToSpecifiedPitchName ??
      getInsertToSpecifiedPitchName({ x, y }, pitchNameMappedToArea.value)
    // console.log(insertToSpecifiedPitchName)
    // console.log(noteItemsMap.value.get(insertToSpecifiedPitchName))
    noteItemsMap.value
      .get(pitchName)
      ?.noteItems.push(noteItemTemplate({ x, y }, pitchName))
  }
  function deleteNoteItem(id, deleteFromSpecifiedPitchName) {
    if (id === undefined || deleteFromSpecifiedPitchName === undefined) return
    // const deleteNoteTarget = noteItemsMap.value
    //   .get(deleteFromSpecifiedPitchName)
    //   .noteItems.find((item) => item.id === id)
    // if(deleteNoteTarget === undefined) return
    const deleteTargetArr = noteItemsMap.value.get(
      deleteFromSpecifiedPitchName,
    ).noteItems
    if (!deleteTargetArr) return

    const deleteIndex = deleteTargetArr.findIndex((item) => item.id === id)
    if (deleteIndex === -1) return
    deleteTargetArr.toSpliced(deleteIndex, 1)
  }
  function snapToOtherPitchNameTrack({ x, y }, expectedInsertToPitchName) {
    const pitchName =
      expectedInsertToPitchName ??
      getInsertToSpecifiedPitchName({ x, y }, pitchNameMappedToArea.value)
    const scaleY = noteItemsMap.value.get(pitchName)?.scaleY

    return scaleY
  }
  function updateNoteItemPosition(id, pitchName, position) {
    if (id === undefined || pitchName === undefined || position.length !== 2)
      return
    const updateNoteTarget = noteItemsMap.value
      .get(pitchName)
      .noteItems.find((item) => item.id === id)
    if (updateNoteTarget === undefined) return
    // const [startY, endY] = noteItemsMap.value.get(pitchName).scaleY
    const [x, y] = position
    const [startY, endY] = snapToOtherPitchNameTrack({ x, y })
    updateNoteTarget.x = x
    updateNoteTarget.y = startY
    // updateNoteTarget.x = x
    // updateNoteTarget.y = y
    // if (y < startY || y > endY) {
    //   const insertToSpecifiedPitchName = getInsertToSpecifiedPitchName(
    //     { x, y },
    //     pitchNameMappedToArea.value,
    //   )
    //   insertNoteItem({ x, y }, insertToSpecifiedPitchName)
    // } else {
    //   updateNoteTarget.x = x
    //   updateNoteTarget.y = y
    // }
  }
  return {
    noteHeight,
    noteItemsMap,
    insertNoteItem,
    deleteNoteItem,
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

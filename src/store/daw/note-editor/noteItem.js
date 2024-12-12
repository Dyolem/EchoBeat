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
    pitchNameMappedToArea.find((item) => {
      const { pitchName, scale } = item
      const [startY, endY] = scale
      if (y >= startY && y < endY) {
        insertToSpecifiedPitchName = pitchName
        return true
      }
    })
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
  function insertNoteItem({ x, y } = {}) {
    if (x === undefined || y === undefined) return

    const insertToSpecifiedPitchName = getInsertToSpecifiedPitchName(
      { x, y },
      pitchNameMappedToArea.value,
    )
    // console.log(insertToSpecifiedPitchName)
    // console.log(noteItemsMap.value.get(insertToSpecifiedPitchName))
    noteItemsMap.value
      .get(insertToSpecifiedPitchName)
      .noteItems.push(noteItemTemplate({ x, y }, insertToSpecifiedPitchName))
  }
  function updateNoteItemPosition(pitchName, id, position) {}
  return { noteHeight, noteItemsMap, insertNoteItem, updateNoteItemPosition }
})

// new Map([
//   [
//     "c4",
//     {
//       pitchName: "c4",
//       scaleY: 20,
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
//       scaleY: 80,
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

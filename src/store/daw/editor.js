import { defineStore } from "pinia"
import {
  BASE_GRID_HEIGHT,
  BASE_GRID_WIDTH,
  BEAT_GRID_RATIO,
  BEATS_COUNT,
  DEFAULT_ZOOM_RATIO,
} from "@/constants/daw/index.js"

export const useEditor = defineStore("editor", () => {
  const editorMap = new Map()
  function initEditor(id, { x, y }) {
    const template = {
      id,
      x,
      y,
      beatCount: BEATS_COUNT,
      height: BASE_GRID_HEIGHT,
      beatBaseGridRatio: BEAT_GRID_RATIO,
      get width() {
        return (
          this.baseGridWidth *
          this.beatBaseGridRatio *
          this.beatCount *
          this.zoomRatio
        )
      },
      baseGridWidth: BASE_GRID_WIDTH,
      baseGridHeight: BASE_GRID_HEIGHT,
      get gridWidth() {
        return this.baseGridWidth * this.zoomRatio
      },
      get widthPerBeat() {
        return this.gridWidth * this.beatBaseGridRatio
      },
      minGridHorizontalMovement: BASE_GRID_WIDTH,
      minGridVerticalMovement: BASE_GRID_HEIGHT,
      zoomRatio: DEFAULT_ZOOM_RATIO,
      scrollLeft: 0,
      scrollTop: 0,
    }
    editorMap.set(id, template)
  }
  function updateEditorParams(id, updateObj) {
    if (typeof updateObj !== "object" || updateObj === null) {
      throw new TypeError("params type error")
    }

    const editor = editorMap.get(id)
    if (!editor) return

    Object.keys(updateObj).forEach((key) => {
      if (key in editor && updateObj[key] !== undefined) {
        editor[key] = updateObj[key]
        console.log(key, editor[key])
      }
    })
  }

  function getPositionInEditor(id) {}
  return { editorMap, initEditor, updateEditorParams }
})

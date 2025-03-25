import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { SELECTION_RECT_PROPERTIES } from "@/constants/daw/index.js"
import { doRectanglesOverlap } from "@/core/graph/doRectanglesOverlap.js"

export const useSelectionStore = defineStore("selectionStore", () => {
  const selectionRectMap = ref(new Map())
  const selectionRectFactory = () => ({
    startX: 0,
    startY: 0,
    width: 0,
    height: 0,
    get endX() {
      return this.startX + this.width
    },
    get endY() {
      return this.startY + this.height
    },
  })

  function initSelectionMap(editorId) {
    selectionRectMap.value.set(editorId, selectionRectFactory())
  }

  /**
   * @param {string} editorId
   * @param {Partial<Record<typeof SELECTION_RECT_PROPERTIES.WRITABLE[keyof SELECTION_RECT_PROPERTIES.WRITABLE], number>>} coords - 坐标对象
   */
  function updateSelectionRect(editorId, coords) {
    const rect = selectionRectMap.value.get(editorId)
    // 处理可写属性
    Object.values(SELECTION_RECT_PROPERTIES.WRITABLE).forEach(
      /** @param {keyof selectionRectMap.value} key */ (key) => {
        if (coords[key] !== undefined) {
          rect[key] = coords[key]
        }
      },
    )
    // 检测计算属性赋值
    Object.values(SELECTION_RECT_PROPERTIES.CALCULATED).forEach((key) => {
      if (coords[key] !== undefined) {
        console.warn(
          `[${this?.constructor?.name || "updateSelectionRect"}] ${key} 是计算属性，禁止直接赋值`,
        )
      }
    })
  }

  const specifiedSelectionParamValue = computed(() => {
    return (editorId, paramName) => {
      const selectionRect = selectionRectMap.value.get(editorId)
      return selectionRect?.[paramName]
    }
  })

  const whetherInSelectionBox = computed(() => {
    return (editorId, judgedRect) => {
      const { startX, startY, width, height } = judgedRect
      const selectionRect = selectionRectMap.value.get(editorId)
      const {
        startX: selectionX,
        startY: selectionY,
        width: selectionWidth,
        height: selectionHeight,
      } = selectionRect
      const isOverlap = doRectanglesOverlap(
        { x: startX, y: startY, width, height },
        {
          x: selectionX,
          y: selectionY,
          width: selectionWidth,
          height: selectionHeight,
        },
      )
      return isOverlap
    }
  })

  const selectedNotesIdSet = ref(new Set())
  function updateSelectedNotesIdSet(newNotesIdSet) {
    if (typeof newNotesIdSet === "string") {
      if (!selectedNotesIdSet.value.has(newNotesIdSet))
        selectedNotesIdSet.value.add(newNotesIdSet)
    } else if (newNotesIdSet instanceof Set) {
      selectedNotesIdSet.value = newNotesIdSet
    } else {
      throw new TypeError(
        `Parameters Types error,expect 'Array' or 'String',but ${typeof newNotesIdSet}`,
      )
    }
  }
  function deleteSelectedNoteId(noteId) {
    selectedNotesIdSet.value.delete(noteId)
  }
  function deleteAllSelectedNoteId() {
    selectedNotesIdSet.value.clear()
  }

  return {
    selectionRectMap,
    specifiedSelectionParamValue,
    whetherInSelectionBox,
    initSelectionMap,
    updateSelectionRect,
    selectedNotesIdSet,
    deleteSelectedNoteId,
    deleteAllSelectedNoteId,
    updateSelectedNotesIdSet,
  }
})

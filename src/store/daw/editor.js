import { defineStore } from "pinia"
import { ref } from "vue"

export const useEditorStore = defineStore("editor", () => {
  const editorMap = ref(new Map())
  function initEditor(id) {
    const template = {
      id,
      scrollLeft: 0,
      scrollTop: 0,
    }
    editorMap.value.set(id, template)
  }
  function updateEditorParams(id, updateObj) {
    if (typeof updateObj !== "object" || updateObj === null) {
      throw new TypeError("params type error")
    }

    const editor = editorMap.value.get(id)
    if (!editor) return

    Object.keys(updateObj).forEach((key) => {
      if (key in editor && updateObj[key] !== undefined) {
        editor[key] = updateObj[key]
      }
    })
  }
  return { editorMap, initEditor, updateEditorParams }
})

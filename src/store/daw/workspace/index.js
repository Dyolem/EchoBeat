import { defineStore } from "pinia"
import { ref } from "vue"

export const useWorkspaceStore = defineStore("workspaceStore", () => {
  const workspaceMap = ref(new Map())
  const workspaceStartPosition = ref(0)
  function createWorkspace({ type, width, startPosition, noteItemsMap }) {
    workspaceStartPosition.value = startPosition
    const date = new Date()
    const id = `${workspaceMap.value.size + 1}${date.getTime()}`
    const workspaceContent = {
      id,
      type,
      noteItemsMap: noteItemsMap,
      width,
      startPosition,
    }
    workspaceMap.value.set(id, workspaceContent)
    return workspaceContent
  }
  return { workspaceMap, createWorkspace, workspaceStartPosition }
})

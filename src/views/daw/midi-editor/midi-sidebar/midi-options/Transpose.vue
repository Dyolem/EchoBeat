<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useSelectionStore } from "@/store/daw/selection.js"
import { storeToRefs } from "pinia"
const noteItemsStore = useNoteItemStore()
const { transposeNoteItem } = noteItemsStore
const selectionStore = useSelectionStore()
const { selectedNotesIdSet } = storeToRefs(selectionStore)
function transposeNoteItemHandler(increment) {
  transposeNoteItem(selectedNotesIdSet.value, increment)
}
</script>

<template>
  <div class="transpose-controller">
    <span class="transpose">Transpose</span>
    <MixEditorButtonGroup size="small">
      <MixEditorButton circle @click="() => transposeNoteItemHandler(1)"
        >+1</MixEditorButton
      >
      <MixEditorButton circle @click="() => transposeNoteItemHandler(-1)"
        >-1</MixEditorButton
      >
      <MixEditorButton circle @click="() => transposeNoteItemHandler(12)"
        >+12</MixEditorButton
      >
      <MixEditorButton circle @click="() => transposeNoteItemHandler(-12)"
        >-12</MixEditorButton
      >
    </MixEditorButtonGroup>
  </div>
</template>

<style scoped>
.transpose-controller {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

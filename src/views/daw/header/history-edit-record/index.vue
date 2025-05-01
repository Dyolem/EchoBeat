<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import {
  undo,
  redo,
  recoverMixTrackDataFromIndexeddb,
} from "@/core/history/index.js"

function undoHandler() {
  undo()
  recoverMixTrackDataFromIndexeddb()
}
function redoHandler() {
  redo()
  recoverMixTrackDataFromIndexeddb()
}
</script>

<template>
  <MixEditorButtonGroup>
    <MixEditorButton title="Undo (Ctrl + Z)" circle @click="undoHandler"
      ><echo-octicon:undo-24></echo-octicon:undo-24>
    </MixEditorButton>
    <MixEditorButton
      title="Redo (Ctrl + Shift + Z)"
      circle
      @click="redoHandler"
    >
      <echo-octicon:redo-24></echo-octicon:redo-24
    ></MixEditorButton>
  </MixEditorButtonGroup>
</template>

<style scoped></style>

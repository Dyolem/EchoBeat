<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
</script>

<template>
  <MixEditorButtonGroup>
    <MixEditorButton title="Undo (Ctrl + Z)"
      ><echo-octicon:undo-24></echo-octicon:undo-24>
    </MixEditorButton>
    <MixEditorButton title="Redo (Ctrl + Shift + Z)">
      <echo-octicon:redo-24></echo-octicon:redo-24
    ></MixEditorButton>
  </MixEditorButtonGroup>
</template>

<style scoped></style>

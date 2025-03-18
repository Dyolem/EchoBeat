<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
</script>

<template>
  <div class="transpose-controller">
    <span class="transpose">Transpose</span>
    <MixEditorButtonGroup size="small">
      <MixEditorButton circle>+1</MixEditorButton>
      <MixEditorButton circle>-1</MixEditorButton>
      <MixEditorButton circle>+12</MixEditorButton>
      <MixEditorButton circle>-12</MixEditorButton>
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

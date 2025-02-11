<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
</script>

<template>
  <MixEditorButton :circle="true" size="large">
    <div class="mode">Dmin</div>
  </MixEditorButton>
</template>

<style scoped>
.mode {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>

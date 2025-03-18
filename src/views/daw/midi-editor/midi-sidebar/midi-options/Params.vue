<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
</script>

<template>
  <div class="params-controller">
    <MixEditorButton circle size="small" class="legato-button"
      >Legato</MixEditorButton
    >
    <MixEditorButton circle size="small" class="Humanize-button"
      >Humanize</MixEditorButton
    >
    <MixEditorButton circle size="small" class="note-value-button"
      ><el-select
        v-model="value"
        placeholder="Select"
        size="small"
        style="width: 240px"
        effect="dark"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        /> </el-select
    ></MixEditorButton>
    <MixEditorButton circle size="small" class="quantize-button"
      >Quantize</MixEditorButton
    >
  </div>
</template>

<style scoped>
.params-controller {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}
</style>

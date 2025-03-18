<script setup>
import { ref, inject } from "vue"

const editorMode = ref("select")
const mainColor = inject("mainColor")
const isPreviewNote = ref(false)
</script>

<template>
  <div class="editor-mode">
    <el-radio-group v-model="editorMode" :fill="mainColor">
      <el-radio-button value="select">
        <echo-material-symbols:arrow-selector-tool-outline-rounded></echo-material-symbols:arrow-selector-tool-outline-rounded
      ></el-radio-button>
      <el-radio-button value="insert"
        ><echo-akar-icons:pencil></echo-akar-icons:pencil
      ></el-radio-button>
      <el-radio-button value="velocity">
        <echo-icon-park-outline:positive-dynamics></echo-icon-park-outline:positive-dynamics
      ></el-radio-button>
    </el-radio-group>
    <div
      class="headphone-icon-box"
      :class="isPreviewNote ? 'preview-note' : ''"
      @click="isPreviewNote = !isPreviewNote"
    >
      <echo-fluent:headphones-48-regular></echo-fluent:headphones-48-regular>
    </div>
  </div>
</template>

<style scoped>
.editor-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
  --editor-mode-main-color: v-bind(mainColor);
}
.headphone-icon-box {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #181d20;
  transition: all 0.2s linear;
}
.headphone-icon-box:hover {
  cursor: pointer;
}
.headphone-icon-box:not(.preview-note):hover {
  background-color: #282c32;
}
.preview-note {
  background-color: var(--editor-mode-main-color);
}
.editor-mode :deep(.el-radio-button__inner) {
  --el-color-primary: var(--editor-mode-main-color);
  --el-button-bg-color: #181d20;
  border: none;
}
.editor-mode :deep(.el-radio-button__inner:hover) {
  --el-color-primary: var(--editor-mode-main-color);
}
</style>

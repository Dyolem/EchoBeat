<script setup>
import { ref, inject, computed } from "vue"
import { EDITOR_MODE_ENUM } from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { storeToRefs } from "pinia"
const zoomRatioStore = useZoomRatioStore()
const { updateEditMode } = zoomRatioStore
const { editorMode } = storeToRefs(zoomRatioStore)

const computedEditMode = computed({
  get: () => {
    return editorMode.value
  },
  set: updateEditMode,
})
const mainColor = inject("mainColor")
const isPreviewNote = ref(false)
</script>

<template>
  <div class="editor-mode">
    <el-radio-group v-model="computedEditMode" :fill="mainColor">
      <el-radio-button :value="EDITOR_MODE_ENUM.SELECT">
        <echo-material-symbols:arrow-selector-tool-outline-rounded></echo-material-symbols:arrow-selector-tool-outline-rounded
      ></el-radio-button>
      <el-radio-button :value="EDITOR_MODE_ENUM.INSERT"
        ><echo-akar-icons:pencil></echo-akar-icons:pencil
      ></el-radio-button>
      <el-radio-button :value="EDITOR_MODE_ENUM.VELOCITY">
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

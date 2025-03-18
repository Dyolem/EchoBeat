<script setup>
import { ref, inject } from "vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
const velocity = ref(0)
const mainColor = inject("mainColor")
</script>

<template>
  <div class="velocity-controller-pad">
    <div class="velocity-value">
      <div class="velocity-title">
        <span>Velocity</span>
        <span>100</span>
      </div>
      <MixEditorButton circle size="small" class="randomize-button"
        >Randomize</MixEditorButton
      >
    </div>
    <div class="velocity-progress-bar">
      <el-slider v-model="velocity" size="large" :min="0" :max="127" />
    </div>
  </div>
</template>

<style scoped>
.velocity-value {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.velocity-title {
  display: flex;
  gap: 10px;
}
.velocity-controller-pad :deep(.el-slider) {
  --el-slider-main-bg-color: v-bind(mainColor);
  --el-slider-height: 2px;
  --el-slider-button-size: 12px;
  --el-slider-button-wrapper-offset: -16px;
}
</style>

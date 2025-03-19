<script setup>
import { ref } from "vue"
const props = defineProps({
  mainColor: {
    type: String,
  },
})
const audioTrackGainValue = ref(50)
</script>

<template>
  <div class="audio-track-volume">
    <el-slider
      v-model="audioTrackGainValue"
      size="small"
      :min="-100"
      :max="6"
    />
  </div>
</template>

<style scoped>
.audio-track-volume {
  width: 100%;
}
.audio-track-volume :deep(.el-slider) {
  --el-slider-main-bg-color: v-bind(mainColor);
  --el-slider-height: 2px;
  --el-slider-button-size: 12px;
  --el-slider-button-wrapper-offset: -16px;
}
</style>

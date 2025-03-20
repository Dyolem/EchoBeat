<script setup>
import { ref, computed } from "vue"
import { useAudioStore } from "@/store/daw/audio/index.js"
const audioStore = useAudioStore()
const props = defineProps({
  mainColor: {
    type: String,
  },
  audioTrackId: {
    type: String,
    required: true,
  },
})

// 响应式存储实际 dB 值（初始值设为 0dB）
const maxDB = 6
const sliderMax = Math.pow(10, maxDB / 20)
const dbValue = ref(0)

// 计算属性处理双向转换
const sliderLinearValue = computed({
  get: () => {
    // 将 dB 转换为线性值
    return Math.pow(10, dbValue.value / 20)
  },
  set: (linear) => {
    // 将线性值转换回 dB
    dbValue.value = 20 * Math.log10(linear)
  },
})
// 自定义 Tooltip 显示 dB 值
const formatTooltip = (linearValue) => {
  return `${(20 * Math.log10(linearValue)).toFixed(1)} dB`
}
function updateAudioTrackVolume(linearVal) {
  audioStore.updateAudioTrackVolumeGainNodeValue({
    audioTrackId: props.audioTrackId,
    gainValue: linearVal,
  })
}
</script>

<template>
  <div class="audio-track-volume">
    <el-slider
      v-model="sliderLinearValue"
      @input="updateAudioTrackVolume"
      size="small"
      :min="0"
      :max="sliderMax"
      :step="0.01"
      :format-tooltip="formatTooltip"
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

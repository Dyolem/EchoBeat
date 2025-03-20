<script setup>
import { ref, computed } from "vue"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { createDbMapper } from "@/core/audio/createDbMapper.js"
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
const sliderMin = 0
const sliderMax = 1
// 响应式存储实际 dB 值（初始值设为 0dB）
const minDb = -40
const maxDb = 6
const mapper = createDbMapper({ minDb, maxDb })
const dbValue = ref(0)

// 计算属性处理双向转换
const sliderLinearValue = computed({
  // 将 dB 转换为线性值
  get: () => mapper.dbToSlider(dbValue.value),
  set: (val) => {
    // 将线性值转换回 dB
    dbValue.value = mapper.sliderToDb(val)
  },
})
// 自定义 Tooltip 显示 dB 值
const formatTooltip = (linearValue) => {
  const preciseDbValue = mapper.sliderToDb(linearValue)
  let val = ""
  val =
    preciseDbValue > 0
      ? `+${preciseDbValue.toFixed(1)}`
      : preciseDbValue.toFixed(1)
  return `${val} dB`
}
function updateAudioTrackVolume(linearVal) {
  const preciseDbValue = mapper.sliderToDb(linearVal)
  const gainValue = 10 ** (preciseDbValue / 20)
  audioStore.updateAudioTrackVolumeGainNodeValue({
    audioTrackId: props.audioTrackId,
    gainValue: gainValue,
  })
}
</script>

<template>
  <div class="audio-track-volume">
    <el-slider
      v-model="sliderLinearValue"
      @input="updateAudioTrackVolume"
      size="small"
      :min="sliderMin"
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

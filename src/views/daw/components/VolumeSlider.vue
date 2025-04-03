<script setup>
import { ref, computed } from "vue"
import { createDbMapper } from "@/core/audio/createDbMapper.js"
const props = defineProps({
  mainColor: {
    type: String,
  },
  afterUpdateVolume: {
    type: Function,
    default: null,
  },
  showVolumeText: {
    type: Boolean,
    default: false,
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
function updateVolume(linearVal) {
  const preciseDbValue = mapper.sliderToDb(linearVal)
  const gainValue = 10 ** (preciseDbValue / 20)
  props.afterUpdateVolume({
    linearSliderValue: linearVal,
    dbValue: preciseDbValue,
    gainValue,
  })
}
const volumeValueText = computed(() => {
  return formatTooltip(sliderLinearValue.value)
})
</script>

<template>
  <div class="volume-container">
    <el-slider
      v-model="sliderLinearValue"
      @input="updateVolume"
      size="small"
      :min="sliderMin"
      :max="sliderMax"
      :step="0.01"
      :format-tooltip="formatTooltip"
    />
    <span class="volume-text" v-if="showVolumeText">{{ volumeValueText }}</span>
  </div>
</template>

<style scoped>
.volume-container :deep(.el-slider) {
  --el-slider-main-bg-color: v-bind(mainColor);
  --el-slider-height: 2px;
  --el-slider-button-size: 12px;
  --el-slider-button-wrapper-offset: -16px;
}
.volume-container {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 20px;
}
.volume-container :deep(.el-slider) {
  --el-slider-main-bg-color: v-bind(mainColor);
  --el-slider-height: 2px;
  --el-slider-button-size: 12px;
  --el-slider-button-wrapper-offset: -16px;
}
.volume-text {
  white-space: nowrap;
  font-size: 12px;
  color: #ffffff;
}
</style>

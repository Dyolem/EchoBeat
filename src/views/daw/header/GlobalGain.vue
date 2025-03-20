<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { createDbMapper } from "@/core/audio/createDbMapper.js"

const audioStore = useAudioStore()
const volume = ref({
  rms: undefined,
  peak: undefined,
  rmsDb: undefined,
  peakDb: undefined,
  rmsNormalized: undefined,
  peakNormalized: undefined,
  displayNormalized: undefined,
})
const maskScalePercentage = computed(() => {
  return `${(1 - volume.value.displayNormalized) * 100}%`
})

const maxDb = 6
const minDb = -40
const sliderMin = 0
const sliderMax = 1

const showPeakHold = ref(false)

// 响应式存储实际 dB 值（初始值设为 0dB）
const dbValue = ref(0)
const mapper = createDbMapper({ minDb, maxDb })

// 计算属性处理双向转换
const globalSliderLinearValue = computed({
  // 将 dB 转换为线性值
  get: () => mapper.dbToSlider(dbValue.value),
  set: (val) => {
    // 将线性值转换回 dB
    dbValue.value = mapper.sliderToDb(val)
  },
})

const globalGainValueText = computed(() => {
  return formatTooltip(globalSliderLinearValue.value)
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
function updateGlobalVolume(linearVal) {
  const preciseDbValue = mapper.sliderToDb(linearVal)
  const gainValue = 10 ** (preciseDbValue / 20)
  audioStore.updateGlobalGainNodeValue(gainValue)
}

let peakTimerId = null
watch(
  () => volume.value.displayNormalized,
  (newDisplayNormalizedVal) => {
    if (newDisplayNormalizedVal === 1) {
      if (peakTimerId !== null) {
        clearTimeout(peakTimerId)
      }
      showPeakHold.value = true
      peakTimerId = setTimeout(() => {
        showPeakHold.value = false
        peakTimerId = null
        clearTimeout(peakTimerId)
      }, 2000)
    }
  },
)

let analyserController = null

onMounted(() => {
  analyserController = new AbortController()
  audioStore.updateMeter(analyserController.signal, volume)
})
onUnmounted(() => {
  analyserController.abort()
})
</script>

<template>
  <div class="global-gain-container">
    <echo-hugeicons:volume-high></echo-hugeicons:volume-high>
    <div class="volume-progress-bar">
      <div class="peak-sign" v-show="showPeakHold"></div>
      <div class="color-bar">
        <div class="mask-color"></div>
      </div>
      <el-slider
        v-model="globalSliderLinearValue"
        size="small"
        :min="sliderMin"
        :max="sliderMax"
        :step="0.001"
        @input="updateGlobalVolume"
        :format-tooltip="formatTooltip"
      />
    </div>
    <span class="gain-text">{{ globalGainValueText }}</span>
  </div>
</template>

<style scoped>
.global-gain-container {
  --volume-width: 100px;
  --slider-height: 4px;
  --mask-scale-percentage: v-bind(maskScalePercentage);
  margin: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  font-size: 14px;
}
.gain-text {
  position: relative;
  width: 80px;
  text-align: center;
  font-size: 12px;
}

.global-gain-container :deep(.el-slider) {
  width: var(--volume-width);
}
.global-gain-container :deep(.el-slider__bar) {
  --el-slider-main-bg-color: #282c32;
  --el-slider-height: var(--slider-height);
}
.global-gain-container :deep(.el-slider__button) {
  background: none;
  border: 1px solid #ffffff;
}
.volume-progress-bar {
  position: relative;
}
.color-bar {
  border-radius: calc(var(--slider-height) / 2);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--volume-width);
  height: var(--slider-height);
  background: linear-gradient(
    to right,
    #80e580 0%,
    #80e5e5 20%,
    #8080ff 40%,
    #e580e5 60%,
    #ff8080 80%,
    #ffff80 100%
  );
  z-index: 1;
}
.mask-color {
  width: var(--volume-width);
  height: var(--slider-height);
  transform-origin: right center;
  transform: scaleX(var(--mask-scale-percentage));
  transition: all 100ms ease-in-out;
  background-color: #282c32;
}
.peak-sign {
  position: absolute;
  right: -8px;
  top: 50%;
  width: 4px;
  height: 4px;
  background: #ffff80;
  margin-left: 4px;
  transform: translateY(-50%);
}
</style>

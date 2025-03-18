<script setup>
import { ref } from "vue"
const globalGainValue = ref(0)
const maskPercentage = ref(50)
</script>

<template>
  <div class="global-gain-container">
    <echo-hugeicons:volume-high></echo-hugeicons:volume-high>
    <div class="volume-progress-bar">
      <div class="color-bar">
        <div class="mask-color"></div>
      </div>
      <el-slider v-model="globalGainValue" size="small" :min="-40" :max="6" />
    </div>
    <span class="gain-text">{{
      `${globalGainValue >= 0 ? "+" : ""}${globalGainValue}`
    }}</span>
  </div>
</template>

<style scoped>
.global-gain-container {
  --volume-width: 100px;
  --slider-height: 6px;
  --mask-scale-percentage: v-bind(maskPercentage + "%");
  margin: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  font-size: 14px;
}
.gain-text {
  position: relative;
  width: 30px;
  text-align: center;
}
.gain-text::after {
  position: absolute;
  right: 0;
  content: "db";
  transform: translateX(100%);
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
  position: absolute;
  width: var(--volume-width);
  height: var(--slider-height);
  transform-origin: right center;
  transform: scaleX(var(--mask-scale-percentage));
  background-color: #282c32;
}
</style>

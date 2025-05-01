<script setup>
import { inject, computed } from "vue"
import { Icon } from "@iconify/vue"

const audioTrackAppearanceInfo = inject("audioTrackAppearanceInfo")
const audioTrackName = computed(() => {
  return audioTrackAppearanceInfo.value.audioTrackName
})
const audioTrackMainColor = computed(() => {
  return audioTrackAppearanceInfo.value.mainColor
})
const audioTrackIcon = computed(() => {
  return audioTrackAppearanceInfo.value.audioTrackIcon
})
</script>

<template>
  <div class="footer-editor-container">
    <div class="header">
      <div class="fixed-head">
        <div class="close-button">
          <Icon icon="material-symbols:close-rounded"></Icon>
        </div>
        <div class="track-badge">
          <i class="track-icon">
            <Icon
              :icon="audioTrackIcon"
              :style="{ color: audioTrackMainColor }"
            ></Icon>
          </i>

          <span class="track-name">{{ audioTrackName }}</span>
        </div>
      </div>
    </div>
    <div class="main-area">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.footer-editor-container {
  --area-border-color: #25292f;
  width: 100%;
  height: 400px;
  background-color: #0f1214;
  display: flex;
  flex-direction: column;
  color: #ffffff;
}
.header {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-block: 1px solid var(--area-border-color);
}
.main-area {
  flex: 1;
  width: 100%;
  padding: 0 10px;
}
.fixed-head {
  min-width: 200px;
  flex: 1;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-inline: 1px solid var(--area-border-color);
}
.close-button {
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.track-badge {
  font-size: 14px;
  height: 100%;
  display: flex;
  align-items: center;
}
.track-icon {
  padding: 0 12px;
  display: flex;
  align-items: center;
}
.track-name {
  font-weight: 600;
}
</style>

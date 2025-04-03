<script setup>
import { computed, ref } from "vue"
import { Icon } from "@iconify/vue"
import { AUDIO_TRACK_TYPE_CONFIG } from "@/constants/daw/index.js"
import { useAudioTrackMainColorStore } from "@/store/daw/audio-track-color/index.js"

const audioTrackMainColorStore = useAudioTrackMainColorStore()
const addedTrackInfo = defineModel("addedTrackType", {
  type: Object,
  default: {},
})

const { getRandomColor } = audioTrackMainColorStore
const trackInfoMap = ref(AUDIO_TRACK_TYPE_CONFIG)
const tracksOption = computed(() => {
  return trackInfoMap.value.values()
})

function addTrackHandler(event) {
  const audioTrackType =
    event.target.closest(".track-items-container").dataset["trackType"] || ""
  addedTrackInfo.value = trackInfoMap.value.get(audioTrackType)
}
</script>

<template>
  <div class="track-menu-container" @click="addTrackHandler">
    <h2 class="track-header">New Track</h2>
    <div
      class="track-items-container"
      v-for="item in tracksOption"
      :key="item.title"
      :data-track-type="item.title"
    >
      <div class="type-item-box">
        <div
          class="icon-box"
          :style="{
            backgroundColor: getRandomColor(),
          }"
        >
          <Icon :icon="item.icon"></Icon>
        </div>
        <div class="desc-box">
          <p class="type-title">{{ item.title }}</p>
          <p class="desc-text">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-menu-container {
  min-width: 200px;
  width: 250px;
  background: #0f1214;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.track-header {
  padding: 0 0 10px 10px;
}
.track-items-container {
  width: 100%;
  height: fit-content;
  padding: 10px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
}
.track-items-container:hover {
  background-color: #2c3238;
}
.type-item-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-box {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  font-size: 20px;
  margin-right: 10px;
}
.desc-box {
  flex-grow: 1;
}
.type-title {
  font-size: 14px;
  font-weight: 600;
}
.desc-text {
  font-size: 12px;
  color: #7f8d9f;
}
</style>

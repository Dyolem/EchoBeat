<script setup>
import { ref, computed } from "vue"
import VolumeSlider from "@/views/daw/components/VolumeSlider.vue"

const isPlaying = ref(false)
const metronomeSoundType = ref("Rim")
const metronomeTypeList = ref([
  "Bleep",
  "Cat",
  "Clave",
  "Conga",
  "CowBell",
  "Default",
  "Rim",
  "Slap",
  "Tick",
])
const metronomeSoundOptions = computed(() => {
  return metronomeTypeList.value.map((type) => ({ value: type, label: type }))
})

function updateMetronomeVolume({ gainValue }) {}
function playMetronomeDemo() {
  isPlaying.value = !isPlaying.value
}
</script>

<template>
  <div class="metronome-setting-container">
    <div class="settings-group">
      <h2 class="title">Tap Tempo</h2>
      <div class="settings-content">
        <div class="adjust-tempo">
          <div class="adjust-button">-</div>
          <div class="tap-tempo">
            <span class="specify-tempo">95</span>
            <span>tap</span>
          </div>
          <div class="adjust-button">+</div>
        </div>
      </div>
    </div>
    <div class="settings-group">
      <h2 class="title">Metronome Sound</h2>
      <div class="settings-content">
        <div class="metronome-sound-selector">
          <el-select v-model="metronomeSoundType" placeholder="Select">
            <el-option
              v-for="item in metronomeSoundOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="metronome-demo-sound" @click="playMetronomeDemo">
          <echo-iconoir:play-solid v-if="!isPlaying"></echo-iconoir:play-solid>
          <echo-material-symbols:pause-rounded
            v-if="isPlaying"
          ></echo-material-symbols:pause-rounded>
        </div>
      </div>
    </div>
    <div class="settings-group">
      <h2 class="title">Metronome Volume</h2>
      <div class="settings-content">
        <div class="volume-icon">
          <echo-hugeicons:volume-high></echo-hugeicons:volume-high>
        </div>
        <VolumeSlider
          main-color="#ffffff"
          :show-volume-text="true"
          :after-update-volume="updateMetronomeVolume"
        ></VolumeSlider>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metronome-setting-container {
  --base-metronome-background: #181b1f;
  --hover-metronome-background: #333a41;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  user-select: none;
}
.settings-group {
  color: #ffffff;
}
.title {
  font-size: 16px;
  font-weight: 600;
  padding: 10px 0;
}
.settings-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.adjust-tempo {
  --tempo-border-radius: 6px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  background: var(--base-metronome-background);
  border-radius: var(--tempo-border-radius);
  cursor: pointer;
}
.adjust-button {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--tempo-border-radius);
  transition: all 0.2s ease-in-out;
}
.adjust-button:hover {
  background: var(--hover-metronome-background);
}
.tap-tempo {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8391a5;
}
.tap-tempo::before {
  position: absolute;
  content: "";
  left: 0;
  width: 2px;
  height: 10px;
  background-color: #262b31;
}
.tap-tempo::after {
  position: absolute;
  content: "";
  right: 0;
  width: 2px;
  height: 10px;
  background-color: #262b31;
}
.specify-tempo {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}
.metronome-sound-selector {
  flex: 1;
  background-color: var(--base-metronome-background);
}
.metronome-demo-sound {
  width: 30px;
  height: 30px;
  margin-left: 10px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--base-metronome-background);
}
.metronome-demo-sound:hover {
  cursor: pointer;
  background-color: var(--hover-metronome-background);
}
.volume-icon {
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

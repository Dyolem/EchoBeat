<script setup>
import Controls from "@/components/playControls/Controls.vue"
import PlayFeature from "@/components/playControls/PlayFeature.vue"
import ProgressBar from "@/components/playControls/ProgressBar.vue"
import { useSongPlayModeStore } from "@/store/songPlayMode.js"
import { storeToRefs } from "pinia"
import { useMediaQuery } from "@/utils/mediaQuery.js"

// const isMobile = ref(false)
const [isMobile] = useMediaQuery("screen and (max-width: 450px)")

const { modeStyle, count } = storeToRefs(useSongPlayModeStore())

// 页面首次加载时，从浏览器获取上次播放模式状态,若没有则设为第一种默认模式
if (JSON.parse(localStorage.getItem("playmode")) == null) {
  count.value = 0
  localStorage.setItem(
    "playmode",
    JSON.stringify(modeStyle.value[count.value].title),
  )
}

const emit = defineEmits(["showMobileSongList"])
function handleMobileSongList() {
  emit("showMobileSongList", true)
}
</script>

<template>
  <div class="mobile-controls-container" v-if="isMobile">
    <PlayFeature></PlayFeature>
    <ProgressBar></ProgressBar>
    <div class="mobile-control">
      <i class="mobile-icon">
        <echo-ic:baseline-toggle-on
          style="color: #fff; width: 40px; height: 40px"
        ></echo-ic:baseline-toggle-on>
      </i>

      <Controls></Controls>
      <i class="mobile-icon" @click="handleMobileSongList">
        <echo-flowbite:list-music-solid
          style="color: #fff; width: 40px; height: 40px"
        ></echo-flowbite:list-music-solid>
      </i>
    </div>
  </div>
  <div class="controls-container" v-if="!isMobile">
    <Controls></Controls>
    <ProgressBar></ProgressBar>
    <PlayFeature></PlayFeature>
  </div>
</template>

<style scoped>
@media screen and (max-width: 450px) {
  .mobile-controls-container {
    --padding-x: 40px;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .mobile-control {
    width: calc(100vw - var(--padding-x) * 2 + 10px);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .mobile-icon {
    display: flex;
    align-items: center;
  }
}
.song-list-drawer {
  position: absolute;
  bottom: 80px;
  width: 100%;
  height: 300px;
  overflow: auto;
  background: #9a6e3a;
}
.controls-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 1px;
  left: 50%;
  width: 90%;
  height: 100px;
  /* background-color: pink; */
  transform: translateX(-50%);
}

.song-title span {
  margin: 0 5px;
  color: #e8e7e6;
}

.singer span:hover {
  cursor: pointer;
  color: #fff;
}
</style>

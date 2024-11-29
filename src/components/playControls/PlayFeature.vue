<script setup>
import { storeToRefs } from "pinia"
import { useSongPlayModeStore } from "@/store/songPlayMode.js"

const { modeStyle, count } = storeToRefs(useSongPlayModeStore())
// 改变播放模式，修改存储的模式
const modifyMode = () => {
  count.value++
  if (count.value > 3) {
    count.value = 0
  }
  localStorage.setItem(
    "playmode",
    JSON.stringify(modeStyle.value[count.value].title),
  )
}
</script>

<template>
  <div class="feature-set">
    <div
      class="play-mode public-size iconfont"
      :class="modeStyle[count].fontClass"
      :title="modeStyle[count].title"
      @click="modifyMode"
    ></div>
    <div class="collect public-size iconfont icon-aixin"></div>
    <div class="download public-size iconfont icon-xiazai"></div>
    <div class="comment public-size iconfont icon-pinglun"></div>
    <!--    <div class="pure-play iconfont"></div>-->
    <!--    <div class="sound-controls iconfont"></div>-->
  </div>
</template>

<style scoped>
.feature-set {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 350px;
  height: 50px;
  /* background-color: coral; */
}
.comment.iconfont:hover {
  color: #45b980;
}
.pure-play {
  width: 70px;
  height: 50px;
  /* background-color: blueviolet; */
}
.sound-controls {
  width: 70px;
  height: 50px;
  /* background-color: blueviolet; */
}
.public-size {
  width: 30px;
  height: 30px;
  /* background-color: lightblue; */
  font-size: 30px;
}
.iconfont {
  color: #e8e7e6;
}

.iconfont:hover {
  color: #ffffff;
  cursor: pointer;
}
@media screen and (max-width: 450px) {
  .feature-set {
    width: calc(100vw - var(--padding-x) * 2);
  }
}
</style>

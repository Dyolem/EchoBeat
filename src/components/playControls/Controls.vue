<script setup>
import { watch } from "vue"
import { useSongPlayLink } from "@/store/songPlayLink.js"
import { userToBePlayedStore } from "@/store/toBePlayed.js"
import { useLyrics } from "@/store/lyrics.js"
import { useSongPlayModeStore } from "@/store/songPlayMode.js"
import { storeToRefs } from "pinia"
const lyrics = useLyrics()
const songPlayLink = useSongPlayLink()
const toBePlayed = userToBePlayedStore()
const { modeStyle, count } = storeToRefs(useSongPlayModeStore())

// 播放暂停切换的逻辑代码
const togglePlay = () => {
  if (songPlayLink.playFlag) {
    songPlayLink.audio.pause()
    songPlayLink.playFlag = false
  } else if (songPlayLink.playFlag === false) {
    songPlayLink.audio.play()
    songPlayLink.playFlag = true
    // console.log('suc');
  }
  //    console.log(songPlayLink.playFlag);
}

// 随机播放模式
const randomPlay = () => {
  let randomIndex = getRandomIntInclusive(0, toBePlayed.song.length - 1) //记得减一，因为歌曲序号从0开始
  songPlayLink.fetchSongPlayLink(randomIndex)
  lyrics.fetchLyrics(
    JSON.parse(localStorage.getItem("toBePlayedSongs"))[randomIndex].mid,
  )
  // songPlayLink.fetchSongCover(randomIndex)
  songPlayLink.playIndex = randomIndex
}
// 列表循环和顺序循环公共代码
const commonCycle = (num) => {
  songPlayLink.playIndex =
    (songPlayLink.playIndex + num) % toBePlayed.song.length //这句代码实现了第一首歌和最后一首歌首尾相连，其中num是关键，具体作用自行理解
  // 还有一个需要注意的点，songplay组件里的那个gif需要playIndex判断，因此playIndex只能重新赋值，不能用其他变量代替
  console.log(songPlayLink.playIndex)
  songPlayLink.audio.pause()
  songPlayLink.fetchSongPlayLink(songPlayLink.playIndex)
  lyrics.fetchLyrics(
    JSON.parse(localStorage.getItem("toBePlayedSongs"))[songPlayLink.playIndex]
      .mid,
  )
  // songPlayLink.fetchSongCover(songPlayLink.playIndex)
}
// 写随机的必要代码，此代码可以放至工具函数里
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min //含最大值，含最小值
}

// 上一首和下一首歌曲的控制代码。由于不同播放模式下的下一首上一首逻辑都不一样，因此分支写在这里面是最简洁的
const preAndLastSong = (num) => {
  // 优化了前进后退播放代码，减少代码重复率。num为模板中传递的值，传的1代表下一首，而toBePlayed.song.length-1是动态值，用于上一首

  if (modeStyle.value[count.value].title === "列表循环") {
    commonCycle(num)
  } else if (modeStyle.value[count.value].title === "随机播放") {
    songPlayLink.audio.pause() //加这句代码是用于上一首歌曲还未播放完时切换下一首，需要及时结束上一首，不然两首歌会一起播放。
    randomPlay()
  } else if (modeStyle.value[count.value].title === "单曲循环") {
    togglePlay()
  } else if (modeStyle.value[count.value].title === "顺序循环") {
    // 当最后一首歌时，不可以再播放下一首，但是可以播放前一首，因此这里关闭下一首的逻辑，但是保留播放上一首的功能
    if (songPlayLink.playIndex === toBePlayed.song.length - 1 && num === 1)
      return
    commonCycle(num)
  }
}

watch(
  () => songPlayLink.ended,
  (newVal, oldVal) => {
    if (newVal) {
      console.log(111)
      songPlayLink.playFlag = false
      preAndLastSong(1) //记得传递1
      // 记得把ended状态改回false，不然只会顺序播放一首
      songPlayLink.ended = false
      // console.log('suc');
    }
  },
)
count.value = modeStyle.value.findIndex(
  (item) => item.title === JSON.parse(localStorage.getItem("playmode")),
)
</script>

<template>
  <div class="controls">
    <div class="pre-song public-control">
      <span
        class="iconfont icon-diyiyeshouyeshangyishou"
        @click="preAndLastSong(toBePlayed.song.length - 1)"
      ></span>
    </div>
    <div class="toggle-play public-control">
      <span
        class="iconfont"
        :class="songPlayLink.playFlag ? 'icon-ai07' : 'icon-24gf-play'"
        @click="togglePlay()"
      ></span>
    </div>
    <div class="last-song public-control">
      <span
        class="iconfont icon-zuihouyiyemoyexiayishou"
        @click="preAndLastSong(1)"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  width: 200px;
  justify-content: space-between;
}
.public-control {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  /* background-color: lightblue; */
  cursor: pointer;
}
.iconfont {
  font-size: 50px;
  color: #e8e7e6;
}
.toggle-play .iconfont {
  font-size: 40px;
}
.iconfont:hover {
  color: #ffffff;
}
@media screen and (max-width: 450px) {
  .controls {
    width: 210px;
  }
}
</style>

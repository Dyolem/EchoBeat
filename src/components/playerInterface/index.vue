<script setup>
import SongOperationOptions from "@/components/playerInterface/SongOperationOptions.vue"
import ToBePlayedSongList from "@/components/playerInterface/ToBePlayedSongList.vue"
import { ref, onMounted, watch } from "vue"
import { useRouter } from "vue-router"

import PlayControls from "@/components/playControls/index.vue"
import imgLyrics from "./imgLyrics.vue"
import { useSongPlayLink } from "@/store/songPlayLink.js"
import { useLyrics } from "@/store/lyrics.js"
import { userToBePlayedStore } from "@/store/toBePlayed.js"
import { useMediaQuery } from "@/utils/mediaQuery.js"

const mediaQueryStatement = "screen and (max-width: 450px)"

const [isMobile] = useMediaQuery(mediaQueryStatement)

const router = useRouter()

const songPlayLink = useSongPlayLink()
const lyrics = useLyrics()
const toBePlayed = userToBePlayedStore()

const checkedSongArray = ref([]) //获取勾选中的歌曲的索引值，用一个数组囊括
const allCheckedRef = ref(null) //获取全选的元素dom
const checkboxRefs = ref([]) //获取所有歌曲勾选状态元素的dom

// 当挂载完成后，获取本地存储的歌曲数据，用于渲染模板

onMounted(() => {
  // 获取列表里的第一首歌曲链接，封面，歌词
  songPlayLink.fetchSongPlayLink(0)
  lyrics.fetchLyrics(JSON.parse(localStorage.getItem("toBePlayedSongs"))[0].mid)

  // 根据歌曲音频源变化，判断歌曲发生了切换,这个是最核心的判断！！！
  watch(
    () => songPlayLink.src,
    async (newVal, oldVal) => {
      console.log("new" + newVal, "old" + oldVal)
      if (!newVal) return
      try {
        const startPlayResult = await songPlayLink.audio.play()
        songPlayLink.playFlag = true
      } catch (error) {
        if (error.name === "NotAllowedError") {
          songPlayLink.playFlag = false
          console.log(songPlayLink.playFlag)
          alert("由于浏览器限制，歌曲无法自动播放，请手动点击。")
        }
        // 没有获取到音频链接的情况
        else if (error.name === "NotSupportedError") {
          songPlayLink.playFlag = false
          console.log(songPlayLink.playFlag)
        }
      }

      // console.log(startPlayResult)
      console.log("change")
      // songPlayLink.playFlag = true

      // if (startPlayResult !== undefined) {
      // 浏览器不支持页面刷新后自动播放的情况
      // if (startPlayResult.name === "NotAllowedError") {
      //   songPlayLink.playFlag = false
      //   console.log(songPlayLink.playFlag)
      //   alert("由于浏览器限制，歌曲无法自动播放，请手动点击。")
      // }
      // // 没有获取到音频链接的情况
      // else if (startPlayResult.name === "NotSupportedError") {
      //   songPlayLink.playFlag = false
      //   console.log(songPlayLink.playFlag)
      // }
      // }
      // console.log(startPlayResult)
      // console.log(songPlayLink.playFlag)
    },
  )
})
const isShowMobileSongList = ref(false)
</script>

<template>
  <div class="bacImage"></div>
  <div class="mask"></div>
  <div class="mod-play">
    <div class="mod-play-left" v-if="!isMobile">
      <SongOperationOptions
        @resetCheckedSongArray="(val) => (checkedSongArray = val)"
        :checkbox-refs="checkboxRefs"
        :checked-song-array="checkedSongArray"
      ></SongOperationOptions>
      <ToBePlayedSongList></ToBePlayedSongList>
    </div>
    <div class="mod-play-right"><img-lyrics></img-lyrics></div>
    <div class="mod-play-bottom">
      <play-controls
        @showMobileSongList="(val) => (isShowMobileSongList = val)"
      ></play-controls>
    </div>
    <Transition name="mobile-song-list">
      <div class="mobile-song-played-list" v-if="isShowMobileSongList">
        <!--      <SongOperationOptions></SongOperationOptions>-->
        <ToBePlayedSongList></ToBePlayedSongList>
        <i class="close-icon" @click="isShowMobileSongList = false">
          <echo-ic:round-close
            style="width: 30px; height: 30px"
          ></echo-ic:round-close>
        </i>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bacImage {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50%;
  filter: blur(65px);
  background-image: v-bind("`url('${songPlayLink.songCover}')`");
  transform: translateZ(0);
}
.mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.5;
}
.mod-play {
  --mod-play-bottom-height: 180px;
  position: relative;
  margin-left: 50px;
  display: flex;
  justify-content: space-between;
  /* vh代表视口单位，1vh表示当前视口的1%长度，所谓视口就是浏览器窗口放大放小
        此处为了是实现浏览器缩放也不会出现滚动条，和歌曲列表的滚动条的长度随视口改变，但是
        物理位置（屏幕看见的）不会发生变化。另外注意，使用了vh，那么所有大型外部盒子高度
        都得用vh表示，混用px依然会导致滚动条出现 */
  height: calc(90vh);

  //margin-left: calc(14vh);
  /* background-color: antiquewhite; */
}
.mod-play-left {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  width: 1000px;
  height: 100%;
  flex-grow: 1;
}
.mod-play-right {
  height: 100%;
  width: 700px;
}
.mobile-song-played-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100vw - 20px);
  position: absolute;
  bottom: 0;
  padding: 20px 10px 0 10px;
  backdrop-filter: blur(20px);
  z-index: 9;
  box-shadow:
    0 2px 2px 2px rgba(0, 0, 0, 0.1),
    0 -2px 2px 2px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-sizing: border-box;
  transition: all 0.3s ease-in-out;
}
.close-icon {
  padding: 20px 0;
  color: #b8b8b8;
}
.close-icon:hover {
  color: #fff;
  cursor: pointer;
}
.mobile-song-list-enter-from,
.mobile-song-list-leave-to {
  opacity: 0;
}

@media screen and (max-width: 450px) {
  .mod-play {
    height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    margin-left: 0;
  }
  .mod-play-right {
    height: calc(100% - var(--mod-play-bottom-height));
    width: 100vw;
  }
  .mod-play-bottom {
    height: var(--mod-play-bottom-height);
    display: flex;
    align-items: center;
  }
}
</style>

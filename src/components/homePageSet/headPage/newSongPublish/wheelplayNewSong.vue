<script setup>
import { toRefs, ref, watch } from "vue"

import playCover from "../../../playCover.vue"

import { useNewSongStore } from '../../../../store/newSong';
import { userToBePlayedStore } from "../../../../store/toBePlayed";
import { useRouter } from "vue-router";




const toBePlayed = userToBePlayedStore()
const newSong = useNewSongStore()

// 获取实际歌曲图片链接
const coverUrlFormatted = (mid) => {
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg`
}



const props = defineProps({
  renderCount: {
    type: Number
  },
  travelDistance: {
    type: Number
  }
})

const newsongWheelRef = ref(null)
const { travelDistance } = toRefs(props)
watch([travelDistance], ([newValue, oldValue]) => {
  newsongWheelRef.value.style.transform = `translateX(-${newValue * 1300}px)`
  console.log(newValue);
})


const formattedTime = (seconds) => {
  let mins = Math.floor(seconds / 60)
  let secs = seconds % 60
  if (mins < 10)
    mins = `0${mins}`
  if (secs < 10)
    secs = `0${secs}`
  return `${mins}:${secs}`
}


const playerWindow = ref(null)
const router = useRouter()
const jumpToPlay = (idx) => {
  console.log(idx);
  const newSongItem = {
    src: "",
    mid: newSong.songlist[idx].mid,
    songname: newSong.songlist[idx].title,
    lasttime: newSong.songlist[idx].interval,
    songcover: newSong.songlist[idx].album.mid,
    albumname: newSong.songlist[idx].album.title,

    // 可能有多个歌手
    singername: newSong.songlist[idx].singer,
    mv: newSong.songlist[idx].mv.vid,
    pay: newSong.songlist[idx].pay.pay_play
  }
  toBePlayed.storageTempSong(newSongItem)


  const route = router.resolve({ path: '/song-play' });

  if (playerWindow.value === null || playerWindow.value.closed) {
    // 如果没有已打开的播放器窗口，或者窗口已关闭，那么就打开一个新窗口,注意这里延迟0.1秒打开，因为数据太多可能还没有请求到，添加一首没这个问题

    playerWindow.value = window.open(route.href, 'myPlayerWindow');


    // 测试代码：添加歌单后，此时窗口已打开，但是添加一首歌依然进入if分支
    // console.log('进入if');
  } else {
    // 如果播放器窗口已经打开，那么就在已有窗口中更新 URL
    playerWindow.value.location.href = route.href;
    playerWindow.value.focus();
  }
  // 一个小bug，歌单整个加入后，如果再添加一首不会刷新列表，暂时没找到原因，用以下代码二次刷新.后续：bug写在了playlistItem里

  playerWindow.value.location.reload();
}
</script>

<template>
  <div class="newsong-container">
    <div class="newsong-wheel" ref="newsongWheelRef">
      <div class="unit" v-for="(broadItem, broadIndex) in renderCount" :key="broadIndex">
        <div class="newsong-item" v-for="(item, index) in newSong.songlist.slice(broadIndex * 9, (broadIndex + 1) * 9)"
          :key="index">
          <div class="song-info">
            <div class="play-cover-box" @click="jumpToPlay(index + broadIndex * 9)">
              <play-cover :jumpId="item.mid" :cover="coverUrlFormatted(item.album.mid)"
                :activeWidthAndHeight="{ width: 90, height: 90 }" :shringkButtonFlag="true" :allowDetail="false">
              </play-cover>
            </div>

            <div class="info">
              <h4 class="song-name"><router-link :to="{ name: 'song-details', params: { mid: item.mid } }"> {{
                item.title
              }}</router-link></h4>
              <p class="singers-box">
                <router-link to="" class="singer" v-for="(i, idx) in item.singer" :key="idx">{{ i.title }}
                  <span v-if="item.singer.length > 1 && idx !== item.singer.length - 1 ? true : false">/</span>
                </router-link>

              </p>

            </div>
            <div class="song-time">{{ formattedTime(item.interval) }}</div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.newsong-container {
  overflow: hidden;
  position: relative;
  display: flex;
  height: 360px;

  /* background-color: bisque; */
}

@media screen and (max-width:450px) {
  .newsong-container {
    overflow-x: auto;
    padding: 0 15px;
  }
}

.newsong-wheel {
  position: absolute;
  display: flex;
  transition: all 0.5s linear;

}

.unit {
  /* margin-right: 20px; */
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 1300px;
  /* background-color: black; */
}

.newsong-item {
  display: flex;
  align-items: center;
  width: 420px;

  height: 120px;
  /* background-color: aquamarine; */
  border-bottom: 1px solid #f2f2f2;
}

.song-info {
  display: flex;

  width: 100%;
  height: 90px;
  /* background-color: pink; */
}

.play-cover-box {
  margin-right: 15px;
}





.info {
  /* display: flex; */
  /* flex-wrap: wrap; */
  padding-top: 20px;
  width: calc(100% - 200px);

  /* height: 100%; */
  /* background-color: lightblue; */
}

.song-name {
  font-weight: normal;
  font-size: 14px;
  width: 100%;
  /* 以下三行代码控制文本内容溢出 */
  overflow: hidden;
  white-space: nowrap;
  /* 不换行 */
  text-overflow: ellipsis;
  /* 溢出内容省略号表示 */
}

.singers-box {

  width: 100%;
  /* 以下三行代码控制文本内容溢出 */
  overflow: hidden;
  white-space: nowrap;
  /* 不换行 */
  text-overflow: ellipsis;
  /* 溢出内容省略号表示 */


}

.singer {
  font-size: 14px;
  color: #999999;
}

.singer:hover {
  color: #31c27c;
}

.song-time {
  margin-left: auto;
  text-align: center;
  width: 70px;
  line-height: 90px;
  color: #999999;
  /* background-color: antiquewhite; */
}
</style>

<template>

  <div class="playlist-item" @mouseover="showMask" @mouseleave="hideMask">
    <play-cover :jump-id="baseInfo.tid" :cover="cover" :active-width-and-height="{ width: 240, height: 240 }"
      @passPlaySignal="jumpToBeplay" :allowDetail="true"></play-cover>
    <div class="introduce">
      <div class="introhead">

        <router-link :to="{ name: 'songlist-details', params: { dissid: baseInfo.tid } }">{{ baseInfo.title
          }}</router-link>
      </div>
      <div class="play-volumn">
        <!-- creator根据需要选择是否插入 -->
        <div class="creator">
          <slot name="creator" :creator="creatorInfo"></slot>
        </div>

        <p>{{ `播放量：${listennum}` }}</p>
      </div>
    </div>
  </div>

</template>

<script setup>

import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';


import { userToBePlayedStore } from '../../../../store/toBePlayed';
import { useSongListDetailStore } from '../../../../store/songlistDetail';
import PlayCover from '../../../playCover.vue';



const songListDetailStore = useSongListDetailStore()
const toBePlayedStore = userToBePlayedStore()


const props = defineProps({
  // 歌单的基础信息，包括tid和title
  baseInfo: {
    type: Object,
    required: true,
  },
  // 歌单封面
  cover: {
    type: String
  },
  // 创建者信息
  creatorInfo: {
    type: Object
  }
})


//注意如果不是在模板中使用传过来的数据，需要加上props
const data = ref(props.baseInfo.playNum)
//控制小数位数显示
const decimalPlaces = ref(1);
//格式化为：xxx.x千万
const listennum = computed(() => {
  const num = data.value;
  const places = decimalPlaces.value;
  if (num < 10000) {
    return num;
  } else {
    const result = (num / 10000).toFixed(places);
    return result + "万";
  }
})


let playerWindow = ref(null)
const router = useRouter()
const jumpToBeplay = async () => {

  // 必须获取到songsStore数据获取到之后才能执行putAllSongs，不然根本没有将数据存入tobeplaystore里，不然新窗口打开是空白
  // 而模板中没有这个问题，因为不用存入tobeplaystore，而且会根据数据刷新视图
  await songListDetailStore.fetchSongDetail(props.baseInfo.tid)
  toBePlayedStore.putAllSongs()
  const route = router.resolve({ path: '/song-play' });

  if (playerWindow.value === null || playerWindow.value.closed) {

    // 如果没有已打开的播放器窗口，或者窗口已关闭，那么就打开一个新窗口

    playerWindow.value = window.open(route.href, 'myPlayerWindow');

    // 测试代码：添加一首歌后，此时窗口已打开，但是添加一个歌单依然进入if分支
    console.log('进入if');

  }
  else {
    // 如果播放器窗口已经打开，那么就在已有窗口中更新 URL
    playerWindow.value.location.href = route.href;

    console.log(11111);
    playerWindow.value.focus();
    //playerWindow.value.location.reload();
    //注意！！！！！！playlistItem组件和playlists组件是两个窗口各自的组件，如果playerWindow.value.location.reload()放在上面，
    // 由于窗口状态独立，所以一首一首歌添加和一个歌单一个歌单的添加会正常执行，即正常进入else执行，但是如果添加一首歌后添加一个歌单，进入了另一个窗口
    // 是不知道窗口已经打开了的，因此是进入if分支，就不会刷新。总结这个陷阱就是窗口状态不一样，导致进入分支错误，解决办法为刷新放在分支出来之后执行
  }

  playerWindow.value.location.reload();




}

</script>


<style scoped>
.playlist-item {
  position: relative;
  font-size: 15px;
  width: 240px;
  height: 300px;
  margin-right: 25px;

}

.play-button {
  display: flex;
  justify-content: center;

  width: 50px;
  height: 50px;
  line-height: 50px;
  background-color: #f2f2f2;
  opacity: 0;
  border-radius: 25px;

  transition: all 0.4s ease-out;
}

.play-button span {
  font-size: 20px;
  color: #545454;
  transform: translateX(3px);
}

.song-cover {
  overflow: hidden;

  margin-bottom: 15px;
  width: 240px;
  height: 240px;

  /* background-color: gold; */
}

.song-cover img {
  width: 100%;
  height: 100%;
  transform: scale(1);
  transition: all 0.4s ease-out;
}

.song-mask {
  display: flex;
  position: absolute;
  top: 0;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  width: 240px;
  height: 240px;

  background-color: rgba(0, 0, 0, 0);
}

/* 点击图片也能跳转至歌单详情界面 */
.song-mask a {
  position: absolute;
  width: 240px;
  height: 240px;
}

.mask-active {
  opacity: 1;
  transform: scale(1.5);
}

.introhead {
  width: 240px;
  /* 以下三行代码控制文本内容溢出 */
  overflow: hidden;
  white-space: nowrap;
  /* 不换行 */
  text-overflow: ellipsis;
  /* 溢出内容省略号表示 */
}

.play-volumn {
  margin-top: 5px;
  color: #999999;
}
</style>

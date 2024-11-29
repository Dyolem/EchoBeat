<script setup>


import playlistRecommendation from '../../playlistRecommendation.vue';
import wheelCatogories from './wheelCatogories.vue';
import playCover from "../../playCover.vue"

import { useSonglistStore } from '../../../store/songlist';
import { useSonglistCategoryStore } from '../../../store/songlistCategory';
import { ref, watch, watchEffect } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter()
const routes = useRoute()
const songlistStore = useSonglistStore()
const songlistCategoryStore = useSonglistCategoryStore()



const recentListnenInfo = ref({})  //被点击过歌单详情所属的分类的id和name


const clearCurrentKind = () => {
  router.push({
    path: '/classified-playlist',

  })

}

const recentClickSonglist = ref([]) // 最近常用的歌单种类数组
// 将常用的歌单种类数组数据持久化
const storeRecentListenInfo = () => {

  recentClickSonglist.value = JSON.parse(localStorage.getItem('recentClickSonglistCategoy')) || []
  if (recentClickSonglist.value.length == 4 && recentClickSonglist.value[recentClickSonglist.value.length - 1].id != recentListnenInfo.value.id)
    recentClickSonglist.value.splice(0, 1)

  if (recentClickSonglist.value.length == 0) {
    recentClickSonglist.value.push(recentListnenInfo.value)
    // console.log('suc');
  }

  else if (recentClickSonglist.value[recentClickSonglist.value.length - 1].id != recentListnenInfo.value.id) {
    recentClickSonglist.value.push(recentListnenInfo.value)
    // console.log('push');
  }

  localStorage.setItem('recentClickSonglistCategoy', JSON.stringify(recentClickSonglist.value))

}
// 当路由查询参数变化时请求数据
watch(() => routes.query, async () => {
  await songlistStore.fetchSongListData(routes.query.t1)
  songlistCategoryStore.CheckCurrentCategory(routes.query.t1)
  // console.log(routes.query.t1);
  recentListnenInfo.value = songlistCategoryStore.currentCategoryAndId
}, { immediate: true })   //这里必须使用immediate，因为组件重新挂载的时候，路由查询参数初始化完成后，监听器还未进行监听，所以不会请求数据。
// 但由于逻辑上是只要路由查询参数变化，就需要立即请求数据，这里由于路由初始化和监听器初始化有先后顺序，所以需要加上immediate


// 使用watchEffect也可以实现
// watchEffect(async()=>{
//     await songlistStore.fetchSongListData(routes.query.t1)
//     songlistCategoryStore.CheckCurrentCategory(routes.query.t1)
//     recentListnenInfo.value=songlistCategoryStore.currentCategoryAndId
// })


</script>

<template>


  <playlist-recommendation :renderCount="Math.ceil(songlistCategoryStore.categoriesLength / 4)">
    <template #wheel-container="slotProps">
      <wheel-catogories :travelDistance="slotProps.passTravelDistance"></wheel-catogories>
    </template>
  </playlist-recommendation>

  <div class="classified-container">

    <div class="kindTitle">
      <p>{{ recentListnenInfo.name }}</p>
      <span class="clear-current-kind iconfont icon-chacha" @click="clearCurrentKind"></span>
    </div>
    <div class="playlists-container">
      <div class="playlist-item" v-for="(item, index) in songlistStore.songlist" :key="item.dissid"
        @click="storeRecentListenInfo">
        <!-- 循环渲染时记得加上：key，给每个循环项添加key，不然有报错 -->
        <play-cover :jump-id="item.dissid" :cover="item.imgurl" :active-width-and-height="{ width: 240, height: 240 }"
          :allowDetail="true">
        </play-cover>
        <div class="introduce">
          <div class="titletxt"><router-link class="txt-color"
              :to="{ name: 'songlist-details', params: { dissid: item.dissid } }">{{ item.dissname }}</router-link></div>
          <div class="creator"><router-link class="txt-color" to="">{{ item.creator.name }}</router-link></div>
          <div class="playnum">播放量：{{ item.listennum }}</div>
        </div>
      </div>
    </div>
  </div>



</template>

<style scoped>
.classified-container {
  margin: 0 auto;
  /* 宽度由来：5*（240+25） */
  width: 1325px;
  flex-wrap: wrap;
  background-color: rgba(rgb(193, 215, 199), 1);
}

.playlists-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  /* background-color: lightblue; */
}

.kindTitle {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
  width: 100px;
  height: 40px;
  /* background-color: aquamarine; */
  border: 1px solid lightgray;
  border-radius: 3px;
}

.kindTitle:hover {
  background-color: #31c27c;
  color: #fff;
}

.clear-current-kind:hover {

  cursor: pointer;
  border-radius: 50%;
  background-color: rgba(193, 215, 199, 0.5);

}

.playlist-item {
  margin-bottom: 50px;
}

.txt-color {
  color: #999999;
}

.txt-color:hover {
  color: #31c27c;
}

.playnum {
  margin-top: 5px;
}
</style>

<script setup>
import { ref, watch } from 'vue';

import { useRecommendPlaylistStore } from '../../../../store/recommendPlaylist'
const recommendPlaylist = useRecommendPlaylistStore()

recommendPlaylist.fetchRecommendForYou()


const categoryArr = ref([
  {
    category: '官方歌单',
    id: '3317'
  },
  {
    category: '经典',
    id: '59'
  },
  {
    category: '情歌',
    id: '71'
  },
  {
    category: '网络歌曲',
    id: '3056'
  },
  {
    category: 'KTV热歌',
    id: '64'
  }
])


// emit作用：1、重置轮播索引：切换分类时，重置当前轮播页面索引。传递一个变化的索引到headPage组件，再传递给playlistRecommendation组件
//          2、传递列表长度，headPage组件将根据该值计算渲染的轮播页面个数
const emit = defineEmits(['passRecommendListLength'])
const selectedIndex = ref(-1)
const getSongLists = (categoryId, idx) => {
  selectedIndex.value = idx

  console.log('suc');

  if (categoryId !== null)
    recommendPlaylist.fetchRecommendPlaylist(categoryId)
  else
    recommendPlaylist.fetchRecommendForYou()

}
watch(() => recommendPlaylist.loaded, () => {
  emit('passRecommendListLength', {
    id: 'recommend',
    listLength: recommendPlaylist.listLength,
    resetIndex: selectedIndex.value
  })
})



</script>

<template>
  <div class="classification-box">
    <div class="titleName" @click="getSongLists(null, -1)" :class="selectedIndex === -1 ? 'selected' : ''">为你推荐</div>
    <div class="titleName" :class="selectedIndex === index ? 'selected' : ''" v-for="(item, index) in categoryArr"
      @click="getSongLists(item.id, index)">{{ item.category }}</div>
  </div>
</template>

<style scoped>
.titleName:hover {
  cursor: pointer;
  color: #31c27c;
}

.selected {
  color: #31c27c;
}

.classification-box {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

@media screen and (max-width:450px) {
  .classification-box {
    width: 100vw;
    /* display: flex;
    justify-content: center; */
  }
}

.titleName {
  margin: 30px 25px
}
</style>


<template>
    <playlist-recommendation :renderCount="recommendPlaylistLength" :resetIndex="initIndex">
         <template #reccomend-head>    
             <h2>歌单推荐</h2>    
         </template>
         <template #song-classification>
             <recommendation-title @passRecommendListLength="passRenderListsLength"></recommendation-title>
         </template>
         <template #wheel-container="slotProps">
             <wheel-container :travelDistance="slotProps.passTravelDistance" :renderCount="recommendPlaylistLength"></wheel-container>
         </template>
    </playlist-recommendation>
    <playlist-recommendation :renderCount="newSongListsLength" :resetIndex="initIndex">
         <template #reccomend-head>    
             <h2>新歌首发</h2>    
         </template>
         <template #song-classification>
             <newsong-categories @passNewSongListsLength="passRenderListsLength"></newsong-categories>
         </template>
         <template #wheel-container="slotProps">
             <wheelplay-new-song :travelDistance="slotProps.passTravelDistance" :renderCount="newSongListsLength"></wheelplay-new-song>
         </template>
    </playlist-recommendation>
 </template>
 
 
 <script setup>
 import { onMounted, ref } from 'vue';
 import playlistRecommendation from '../../playlistRecommendation.vue';
 import wheelContainer from '../../recommendation/wheelContainer.vue';
 import recommendationTitle from '../../recommendation/recommendationTitle.vue'
 
 import newsongCategories from './newsongCategories.vue';
 import wheelplayNewSong from './wheelplayNewSong.vue'
 
 import {useRecommendPlaylistStore} from "../../../store/recommendPlaylist"
 import { useNewSongStore } from '../../../store/newSong';
 const recommendPlaylist=useRecommendPlaylistStore()
 const newSong= useNewSongStore()
 
 
 
 const recommendPlaylistLength=ref(0)
 const newSongListsLength=ref(0)
 
 
 // 重置轮播索引的部分代码
 const initIndex=ref(null)
 const passRenderListsLength =(obj)=> {
     if(obj.id=='recommend')
     {
         recommendPlaylistLength.value=Math.ceil(obj.listLength/5)
         initIndex.value=obj.resetIndex
     }
     else if(obj.id=='newSongPublish')
     {
         newSongListsLength.value=Math.ceil(obj.listLength/9)
         console.log(newSongListsLength.value);
         initIndex.value=obj.resetIndex
     }
     
     
 }
 
         //    下面是数据请求开始
 //    第一种监听请求方法，使用watch
 //     songlistCategoryStore.fetchSongListCategoriesData()
 //     watch(() => songlistCategoryStore.categoryIds, (newVal, oldVal) => {
 //      console.log('categoryIds changed from', oldVal, 'to', newVal)
 //    songlistStore.fetchSongListData()
 //    })
 // 第二种如下
 const fetchAndWatchData = async () => {
  
 
         await newSong.fetchNewSong(0)
     };
 
     onMounted(() => {
     
       fetchAndWatchData();
     
     });
 
 </script>
 
 <style scoped>
 
 </style>

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

    <playlist-recommendation :renderCount="excellentRecommendationListsLength" >
         <template #reccomend-head>    
             <h2>精彩推荐</h2>    
         </template>
         <template #wheel-container="slotProps">
             <wheel-excellent-recommendation :travelDistance="slotProps.passTravelDistance" :renderCount="excellentRecommendationListsLength"
                                             @passExcellentRecListsLength="passRenderListsLength">
             </wheel-excellent-recommendation>
         </template>
    </playlist-recommendation>

    <playlist-recommendation :renderCount="newAlbumListsLength" >
         <template #reccomend-head>    
             <h2>新碟首发</h2>    
         </template>
         <template #song-classification>
            <new-album-category @passNewAlbumListsLength="passRenderListsLength"></new-album-category>
         </template>
         <template #wheel-container="slotProps">
            <wheel-play-new-album :travelDistance="slotProps.passTravelDistance" :renderCount="newAlbumListsLength"></wheel-play-new-album> 
         </template>
    </playlist-recommendation>

    <ranking-vue></ranking-vue>

 </template>
 
 
<script setup>
 import { onMounted, ref } from 'vue';
 import playlistRecommendation from '../../playlistRecommendation.vue';


 import wheelContainer from "./recommendation/wheelContainer.vue";
 import recommendationTitle from './recommendation/recommendationTitle.vue'
 
 import newsongCategories from './newSongPublish/newsongCategories.vue';
 import wheelplayNewSong from './newSongPublish/wheelplayNewSong.vue'
 
 import WheelExcellentRecommendation from './excellentRecommendation/wheelExcellentRecommendation.vue';

 import NewAlbumCategory from './newAlbumPublish/newAlbumCategory.vue';
 import WheelPlayNewAlbum from './newAlbumPublish/wheelPlayNewAlbum.vue';
 
 import rankingVue from './rankingList/ranking.vue';

 import {useRecommendPlaylistStore} from "../../../store/recommendPlaylist"
 import { useNewSongStore } from '../../../store/newSong';
 import { useNewAlbumStore } from '../../../store/newAlbum';





 const newAlbum= useNewAlbumStore()

 const recommendPlaylist=useRecommendPlaylistStore()
 const newSong= useNewSongStore()
 
 
 
 const recommendPlaylistLength=ref(0)
 const newSongListsLength=ref(0)
 const excellentRecommendationListsLength=ref(0)
 const newAlbumListsLength=ref(0)
 
 
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
     else if(obj.id=='excellentRecommentdation')
     {
        excellentRecommendationListsLength.value=Math.ceil(obj.listLength/2)
        console.log(excellentRecommendationListsLength.value);
     }
     else if(obj.id=='newAlbumPublish')
     {
         newAlbumListsLength.value=Math.ceil(obj.listLength/10)
            console.log(newAlbumListsLength.value);
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
  
 
        newSong.fetchNewSong(0)
        newAlbum.fetchNewAlbum(1)
         
     };
 
     onMounted(() => {
     
       fetchAndWatchData();
     
     });
 
 </script>
 
 <style scoped>
 
 </style>
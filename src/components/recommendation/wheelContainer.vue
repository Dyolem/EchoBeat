<template>
    <!-- 实现轮播图 -->
<div class="wheel-container">
    <!-- 使用flex，让渲染的五个div能横向排列。不能通过另一个组件控制
    横向排列，除非是渲染5个组件 -->
    <div class="playlist-container" ref="playlistContainer">
                <!-- <div class="playlist-item-occupation" v-for="items in songInformationstore.songlist" :key="items.id"> -->
            
            <div class="playlist-item-occupation" v-for="(items,index) in recommendPlaylist.titleAndTid" :key="items.tid">
                <!-- 循环渲染时记得加上：key，给每个循环项添加key，不然有报错 -->
                <PlaylistItem :baseInfo="items"  :cover="recommendPlaylist.cover[index]" :creatorInfo="recommendPlaylist.creator[index]"></PlaylistItem>
            </div>
    </div>
        
</div>

</template>

<!-- 使用pinia，创建实例步骤时，记得检查有无setup（）或者script setup -->
<script setup>
import PlaylistItem from './playlistItem.vue';
import { ref,watch,toRefs} from 'vue';
import { useRecommendPlaylistStore } from '../../store/recommendPlaylist';


    const recommendPlaylist=useRecommendPlaylistStore()

    const playlistContainer=ref(null)
    
    
  //接收父组件传递过来的index，即travelDistance，控制轮播列表移动距离
    const props=defineProps({
        travelDistance:{
            type:Number,
            required:true,
        }
    }) 
    
//侦听数据变化，若变化则执行函数。注意这里不能直接使用playlistContainer.value.style.transform = `translateX(-${newValue * 1325}px)`
//传递的数据是没有失去响应性的，只是模板中数据虽然会自动刷新，但是js中它只执行一次，即使数据变了，也不会再执行那段代码了
// 所以要使用watch才能起效
//     const { travelDistance } = toRefs(props)
//     watch([travelDistance], ([newValue, oldValue]) => {
//         playlistContainer.value.style.transform = `translateX(-${newValue * 1325}px)`
//         console.log(newValue);
//     })

    watch(()=>props.travelDistance, (newValue, oldValue) => {
        playlistContainer.value.style.transform = `translateX(-${newValue * 1325}px)`
        console.log(newValue);
    })
   



    
    
        
</script>

<style scoped>
.wheel-container {
    margin-bottom: 50px;
   overflow: hidden;
    position: relative;
    height: 300px;
    /* playlistitem组件一个240px，五个1300px，加上四个margin-tight的25px，一共1300px */
    width: 1300px; 
    
}
.playlist-container {
  
  
    display: flex;
    justify-content: space-between;
    transform: translateX(0px);
    
    transition: all 0.5s linear;
    
}
    
    
</style>
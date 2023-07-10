<script setup>
import { ref,watch } from "vue"
import { useNewAlbumStore } from "../../../../store/newAlbum"
import playCover from "../../../playCover.vue"
const newAlbum=useNewAlbumStore()
const wheelAlbumRef=ref(null)

const props=defineProps({
    renderCount:{
        type:Number
    },
    travelDistance:{
        type:Number
    }
})
// 获取实际歌曲图片链接
const coverUrlFormatted =(mid)=>{
    return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${mid}.jpg`
}

watch(()=>props.travelDistance, (newValue, oldValue) => {
        wheelAlbumRef.value.style.transform = `translateX(-${newValue * 1300}px)`
        console.log(newValue);
    })
</script>

<template>
    <div class="new-album-comtainer">
        <div class="wheel-album" ref="wheelAlbumRef">
            <div class="album-unit" v-for="(unitItem,unitIndex) in renderCount" :key="unitIndex">
                <div class="album-item" v-for="(item,index) in newAlbum.list.slice(unitIndex*10,(unitIndex+1)*10)" :key="index">
                    <play-cover :jump-id="item.mid" :cover="coverUrlFormatted(item.mid)" :active-width-and-height="{width:240,height:240}"
                                 @passPlaySignal="jumpToBeplay" :allowDetail="true"></play-cover>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .new-album-comtainer {
        overflow: hidden;
        position: relative;
        width: 1300px;
        height: 600px;
        background-color: pink;
    }
    .wheel-album {
        position: absolute;
        display: flex;
        transition: all 0.3s ease-in-out;
    }
    .album-unit {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 1300px; 
    }
    .album-item {
        
        margin-bottom: 30px;
        width: 240px;
        height: 240px;
        background-color: antiquewhite;
    }
</style>
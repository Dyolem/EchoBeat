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

const jumpToBeplay=()=>{

}
</script>

<template>
    <div class="new-album-comtainer">
        <div class="wheel-album" ref="wheelAlbumRef">
            <div class="album-unit" v-for="(unitItem,unitIndex) in renderCount" :key="unitIndex">
                <div class="album-item" v-for="(item,index) in newAlbum.list.slice(unitIndex*10,(unitIndex+1)*10)" :key="index">
                    <play-cover :jump-id="item.mid" :cover="coverUrlFormatted(item.mid)" :active-width-and-height="{width:240,height:240}"
                                 @passPlaySignal="jumpToBeplay" :allowDetail="true">
                    </play-cover>
                    <div class="introduce">
                        <div class="album-title txt-ellipsis"><router-link to="" class="title-a public-a">{{ item.name }}</router-link></div>
                        <div class="singer txt-ellipsis"><router-link  class="singer-a public-a" to="" v-for="(singer,index) in item.singers" :key="index">{{ singer.name }}<span v-if="index!==item.singers.length-1">/</span></router-link></div>
                    </div>
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
        height: 620px;
        /* background-color: pink; */
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
        
        margin-bottom: 70px;
        width: 240px;
        height: 240px;
        /* background-color: antiquewhite; */
    }
    .introduce {
        width: 240px;
        height: 40px;
        /* background-color: aquamarine; */
    }
    .title-a {
       color: #999999;
    }
    .txt-ellipsis {
        overflow: hidden;
        white-space: nowrap;
  /* 不换行 */
        text-overflow: ellipsis;
    }
    .public-a {
        font-size: 14px;
        cursor: pointer;
        
    }
    .public-a:hover {
        color: #31c27c;
    }
</style>
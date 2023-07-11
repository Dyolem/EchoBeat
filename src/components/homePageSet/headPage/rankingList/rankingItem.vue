<script setup>
import { ref } from "vue"


const props=defineProps({
    songlistInfo:{
        type:Object
    },
    order:{
        type:Number
    }
})
const imgOrder=ref([])
imgOrder.value=[
    {
    order:0,
    imgScale:'img-scale',
},
{
    order:1,
    imgScale:'img-scale2',
},
{
    order:2,
    imgScale:'img-scale3',
},
    
{
    order:3,
    imgScale:'img-scale4'
}
    
]
const revealFlag=ref(false)
</script>

<template>
   
        <div class="ranking-item" @mouseenter="revealFlag=!revealFlag" @mouseleave="revealFlag=!revealFlag">
            <img  :class="imgOrder[order].imgScale" src="https://y.qq.com/ryqq/static/media/bg_index_top.5314c494.jpg?max_age=2592000" alt="">
            <div class="ranking-head">
                <h3 class="txt-mid title">巅峰榜</h3>
                <h3 class="txt-mid">{{ songlistInfo.label }}</h3>
            </div>
            <div class="play-box">
                <div class="play-button" :class="revealFlag?'reveal':''" >
                    <span class="iconfont icon-triangle-play"></span>
                </div>
                <!-- <div class="dispear-play-button" v-if="!revealFlag"></div> -->
            </div>
            <div class="songlist">
                <div class="song-info" v-for="(item,index) in songlistInfo.song" :key="index">
                    <div class="songname"><span class="order">{{ index+1 }}</span><router-link class="public" to="">{{ item.title }}</router-link></div>
                    <div class="singer"><router-link class="public" to="">{{ item.singerName }}</router-link></div>
                </div>
            </div>
            


        </div>
    
</template>

<style scoped>
    .ranking-item {
        position: relative;
        width: 240px;
        height: 600px;
        /* background-color: lightblue; */
    }
    .img-scale {
        position: absolute;
        width: 240px;
        height: 600px;
        object-position: 0px 0px;
        object-fit: cover;
        z-index:9;
    }
    .img-scale2 {
        position: absolute;
        width: 240px;
        height: 600px;
        object-position: -270px 0px;
        object-fit: cover;
        z-index:9;
    }
    .img-scale3 {
        position: absolute;
        width: 240px;
        height: 600px;
        object-position: -540px 0px;
        object-fit: cover;
        z-index:9;
    }
    .img-scale4 {
        position: absolute;
        width: 240px;
        height: 600px;
        object-position: -810px 0px;
        object-fit: cover;
        z-index:9;
    }
    .img-scale5 {
        position: absolute;
        width: 240px;
        height: 600px;
        object-position: -1080px 0px;
        object-fit: cover;
        z-index:9;
    }
    .ranking-head {
        position: relative;
        margin-top: 50px;
        width: 100%;
        /* height: 100px; */
        z-index: 99;
    }
    .txt-mid {
        font-weight: normal;
        font-size: 28px;
        text-align: center;
        color: #fff;
    }
    .title {
        font-weight: 100;
        font-size: 24px;
    }
    .play-box {
        margin: 20px 0px;
        height: 50px;
        display: flex;
        justify-content:center;
        align-items: center;
    }
    .play-button {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 50px;
            height: 50px;
            
            background-color: #f2f2f2;
            opacity: 0;
            border-radius: 50%;
           
            transition: all 0.4s ease-out;
            z-index: 99;
         }
         .play-button span {
            font-size: 20px;
            color: #545454;
            transform: translateX(3px);
         }
         .dispear-play-button {
            position: relative;
            width: 40px;
            height: 3px;
            background-color: #fff;
            z-index: 99;
            transition: all 0.4s ease-out;
         }
         .reveal {
            opacity: 1;
         }
    .song-info {
        position: relative;
        margin-left: 25px;
        margin-bottom: 40px;
        width: 200px;
        /* height: 50px; */
        color: #fff;
        /* background-color: black; */
        z-index: 99;
    }
    .songname {
        margin-bottom: 8px;
        overflow: hidden;
        white-space: nowrap;
        /* 不换行 */
        text-overflow: ellipsis;
    }
    
    .order {
        margin-right: 10px;
    }
    .singer {
        margin-left: 20px;
        overflow: hidden;
        white-space: nowrap;
        /* 不换行 */
        text-overflow: ellipsis;
    }
    .public {
        
        font-size: 15px;
        color: #fff;
        
    }
    .public:hover {
        color: #fff;
    }
</style>
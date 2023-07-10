<script setup>
import detailsTemplate from '../detailsTemplate.vue';
import songLyrics from './songLyrics.vue'
import { useSongInfoStore } from '../../store/songInfo';
import { useLyrics } from '../../store/lyrics';

import {  ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const songInfoStore = useSongInfoStore()
const lyrics=useLyrics()


const isLoading=ref(true)

    const route=useRoute()
    songInfoStore.fetchSongInfo(route.params.mid)
    lyrics.fetchLyrics(route.params.mid)


const title =ref(null)
const singerArr=ref([])

watch(()=>songInfoStore.loading,(newVal,oldVal)=>{
    // console.log(1111111111);
    // console.log(newVal);
    // console.log(songInfoStore.trackInfo);
    console.log('change');
    title.value=songInfoStore.trackInfo.title
    songInfoStore.trackInfo.singer.forEach(item => {
        singerArr.value.push(item.title)
    })
    isLoading.value=false
})

// 控制复制成功弹窗显示消失
const popoverFlag=ref(false)
const passCopySuccessFlag=(flag)=>{
    popoverFlag.value=flag
    setTimeout(()=>{
        popoverFlag.value=false
    },2000)
}


</script>
 
<template>
    <!-- 使用v-if有两个目的：1，等待数据加载完后再渲染模板，2，避免出现用户看见上一张图片更新成下一张图片，3，由于需要给子组件传递值，避免控制台警告
    缺点：会出现白屏，解决方法是使用一个加载动画 -->
    <div class="mid-container" >
        <details-template :headline="title" :singerName="singerArr" :imgUrl="songInfoStore.imgUrl" v-if="!isLoading">
            <template #jumpPlay>
                <div class="jump-btn" @click="jumpPlayAll"><span class="iconfont icon-24gf-play"></span>播放</div>
            </template>
            <template #info>
                <div class="song-info">
                    <!-- 这里使用v-if是因为有些歌曲不一定都有这五个信息，按需渲染 -->
                    <div class="album-title public" v-if="songInfoStore.trackInfo.album">专辑：{{ songInfoStore.trackInfo.album.title }}</div>
                    <div class="language public" v-if="songInfoStore.info.lan">语种：<span v-for="item in songInfoStore.info.lan.content">{{ item.value }}</span></div>
                    <div class="genre public" v-if="songInfoStore.info.genre">流派：<span v-for="item in songInfoStore.info.genre.content">{{ item.value }}</span></div>
                    <div class="company public" v-if="songInfoStore.info.company">唱片公司：<span v-for="item in songInfoStore.info.company.content">{{ item.value }}</span></div>
                    <div class="issue-time public" v-if="songInfoStore.info.pub_time">发行时间：<span v-for="item in songInfoStore.info.pub_time.content">{{ item.value }}</span></div>
                </div>
            </template>
            <template #intelligentJudge>
                <div class="intelligentJudge">智能曲谱</div>
            </template>
        </details-template>
        <div class="song-lyrics">
            <song-lyrics @passCopySuccessFlag="passCopySuccessFlag"></song-lyrics>
        </div>
    </div>
    <!-- 复制成功的弹窗 -->
    <div class="full-screen-popover" v-if="popoverFlag">
        <div class="copy-suc"><span class="iconfont icon-gou suc-icon"></span></div>
        <p class="suc-txt">复制成功 !</p>
    </div>
</template>

<style scoped>
.mid-container {
    padding: 20px 0px 0px 0px;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    width: 1300px;
    /* height: 2000px; */
    /* background-color: antiquewhite; */
}
.jump-btn {
        margin-right: 10px;
        display: flex;
        width: 135px;
        height: 45px;
        /* background-color: bisque; */
        justify-content: center;
        align-items: center;
        color: #fff;
        background-color: #31c27c;
        border: none;
        border-radius: 3px;
        
    }
    .jump-btn:hover  {
        cursor: pointer;
        background-color: #2caf6f;
    }
    .song-info {
        display: flex;
        
        flex-wrap: wrap;
        align-content: center;
        width: 650px;
        
        /* background-color: pink; */
    }
    .public {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 20px;
        width: 300px;
        height: 30px;
        line-height: 30px;
        /* background-color: #31c27c; */
    }
    .intelligentJudge {
        margin-right: 10px;
        display: flex;
        width: 135px;
        height: 45px;
        /* background-color: bisque; */
        justify-content: center;
        align-items: center;
        border: 1px solid #c9c9c9;
        border-radius: 3px;
    }
    .intelligentJudge:hover {
        cursor: pointer;
        background-color: #ededed;
    }
    .full-screen-popover {
        position: fixed;
        top: 50%;
        left: 50%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        width: 200px;
        height: 200px;
        background-color: rgba(0,0,0,.7);
        border-radius: 3px;
        z-index: 9999;
    }
    .copy-suc {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 15px 0 20px 0;
        width: 60px;
        height: 60px;
        border: 2px solid #fff;
        border-radius: 50%;
    }
    .suc-icon {
        font-size: 30px;
        color: #fff;
    }
    .suc-txt {
        font-size: 20px;
        color: #fff;
        text-align: center;
        width: 100%;
    }
</style>
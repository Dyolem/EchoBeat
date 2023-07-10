<script setup>
import { ref } from 'vue';
import { useLyrics } from '../../store/lyrics';

const lyrics =useLyrics()

// 控制歌词展示长度
const cutOffPos=ref(15)
const unfoldFlag=ref(false)
const unfoldLyrics=()=>{
    if(unfoldFlag.value===false)
    {
        cutOffPos.value=lyrics.songLyrics.length
        unfoldFlag.value=true
        console.log('suc');
    }
    else
    {
        cutOffPos.value=15
        unfoldFlag.value=false
        console.log('suc');
    }
}

// 复制逻辑以及传递复制状态标志给父组件
const copyLyricsArr=ref([])
const copySuccessFlag=ref(false)
const emit=defineEmits(['passCopySuccessFlag'])
const copyLyrics =()=>{
    lyrics.songLyrics.forEach(item=>{
        copyLyricsArr.value.push(item.txt)
    })
    const copyLyricsString= copyLyricsArr.value.toString()
    // console.log(copyLyricsString);
    // 把复制的字符串写入操作系统剪贴板
    navigator.clipboard.writeText(copyLyricsString).then(()=>{
        copySuccessFlag.value=true
        emit('passCopySuccessFlag',copySuccessFlag.value)
    },()=>{
        copySuccessFlag.value=false
        alert('复制失败')
    })
}
</script>

<template>
    <div class="lyrics-container">
        <div class="head-title">
            <h2 class="lyrics-hd">歌词</h2><span class="copy-btn" title="复制歌词" @click="copyLyrics" v-if="lyrics.songLyrics"></span>
        </div>
        <div class="lyrics-container">
            <p class="lyrics-item" v-for="(item,index) in lyrics.songLyrics.slice(0,cutOffPos)" :key="index">{{ item.txt }}</p>
            <div class="unfold-btn" @click="unfoldLyrics" v-if="unfoldFlag">[收起]</div>
            <div class="unfold-btn" @click="unfoldLyrics" v-if="!unfoldFlag">[展开]</div>
        </div>
    </div>
    
</template>

<style scoped>
    .lyrics-container {
        
        width: 940px;
        background-color: #fbfbfd;
    }
    .lyrics-hd {
        margin-right: 10px;
        display: inline-block;
        font-size: 20px;
        font-weight: 400;
        
    }
    .copy-btn {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-position: -100px -40px;
        margin-top: 13px;
        background-image: url(https://y.qq.com/ryqq/static/media/icon_sprite.630b3e60.png?max_age=2592000);
    }
    .copy-btn:hover {
        cursor: pointer;
        background-position: -100px -60px;
    }
    .lyrics-container {
        width: 500px;
        /* background-color: lightblue; */
    }
    .lyrics-item {
        margin: 10px 0;
        /* background-color: pink; */
    }
    .unfold-btn:hover {
        cursor: pointer;
        color:#31c27c;
    }
    
</style>
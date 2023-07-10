<script setup>

import { ref,onMounted,watch} from 'vue';
import { useRouter,useRoute } from 'vue-router';

import playlists from './playlists.vue';
import DetailsTemplate from '../detailsTemplate.vue';


import { userToBePlayedStore } from '../../store/toBePlayed';
import { useSongListDetailStore} from '../../store/songlistDetail'


const toBePlayedStore =userToBePlayedStore()

const songlistDetail=useSongListDetailStore()
     

    const route=useRoute()
    onMounted(async () => {
        console.log(route.params.dissid);
        
        await songlistDetail.fetchSongDetail(route.params.dissid)
        
    })
        const info =ref({})
        const flag=ref(false)
        watch(() => songlistDetail.loading, (newVal, oldVal) => {
            flag.value=true
            // console.log(info.value);
    // 经测试，请求数据里缺失歌单标签 2023.06.06
    })
 
    // 以下代码其实就是搬的playitems里的代码
    let playerWindow = ref(null)
    const router = useRouter()
    function jumpPlayAll (){
        toBePlayedStore.putAllSongs()
        const route = router.resolve({ path: '/song-play' });
        if (playerWindow.value === null || playerWindow.value.closed) {
            
            // 如果没有已打开的播放器窗口，或者窗口已关闭，那么就打开一个新窗口
        
            playerWindow.value = window.open(route.href, 'myPlayerWindow');
        
            // 测试代码：添加一首歌后，此时窗口已打开，但是添加一个歌单依然进入if分支
            console.log('进入if');
            
        } 
        else {
            // 如果播放器窗口已经打开，那么就在已有窗口中更新 URL
            playerWindow.value.location.href = route.href;  

            playerWindow.value.focus();
            
        }
        
        playerWindow.value.location.reload();
   }

    
</script>
<template>
    
   <div class="main" >
        <details-template :headline="songlistDetail.dissname" :singerName="songlistDetail.nickname" :imgUrl="songlistDetail.logo">
            <template #headline></template>
            <template #info>
                <ul class="data-info">
                    <li ><span>标签：</span>
                        <span v-for="(i,idx) in info.tags" :key="idx">
                            <router-link to="">{{ i.name }}</router-link>&nbsp
                        </span>
                    </li>
                    <li>播放量：{{ (songlistDetail.visitNum/10000).toFixed(1)+'万' }}</li>
                    <li>收藏量：{{ (songlistDetail.visitNum/10000).toFixed(1)+'万' }}</li>
                </ul>
            </template>
            <template #jumpPlayAll>
                <div class="public-size" @click="jumpPlayAll"><span class="iconfont icon-24gf-play"></span>播放全部</div>
            </template>

        </details-template>
        <div class="songlist">
            <div class="songlist-head">
                <ul>
                    <div class="occupation"></div>
                    <li>歌曲</li>
                    <li>歌手</li>
                    <li>专辑</li>
                    <li>时长</li>
                </ul>
            </div>
           
           <playlists></playlists>
            
        </div>
        <div class="introduce">
            <h3 class="title">简介</h3>
            <p class="text-content">{{ songlistDetail.desc }}</p>
            <div class="more"><router-link to="">[更多]</router-link></div>
        </div>
   </div>

</template>



<style scoped>
    .main {
        padding: 20px 0px 0px 0px;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        width: 1300px;
        height: 2000px;
        /* background-color: antiquewhite; */
    }
   
    .data-info li{
       
       height: 30px;
       line-height: 30px;
   }
    .public-size {
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
   

    .public-size:hover  {
        background-color: #2caf6f;
    }
    .songlist {
        /* 可以控制歌曲第一栏背景颜色 */
        width: 940px;
        height: 50px;
        background-color: #fbfbfd;
    }
    .occupation {
        
        width: 30px;
        height: 50px;
        line-height: 50px;
        text-align: center;
    }
    .songlist-head ul{
        display: flex;
        justify-content: flex-start;
        width: 940px;
        height: 50px;
        /* background-color: bisque; */
    }
  
    .songlist-head li {
        display: inline-block;
        padding-left: 15px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width:160px;
        height: 50px;
        line-height: 50px;
    }
    .songlist-head ul li:nth-of-type(1) {
        display: flex;
        justify-content: space-between;
       width: 450px;
       height: 50px;
        
    }
    .songlist-head ul li:nth-of-type(4) {
        width: 50px;
        height: 50px;
    }
    /* 奇数项歌曲变色，头栏包括在内 */
    .songlist-head:nth-of-type(2n) {
        background-color: #fcfcfc;
    }
    /* 这里容易选择器权重错误 */
    /* 控制歌名盒子长度 */
    .songlist-head ul li:nth-of-type(1) .songname {
        display: flex;
        
        align-items: center;
        width: 250px;
        height: 50px;
        /* background-color: lightblue; */
        
    }
    .songname-container {
        /* 不要设置宽度，歌名太长和窗口缩小，总内容大于songname长度都会触发文本省略，不用管了 */
        /* 控制文本溢出 */
        overflow: hidden;
        text-overflow: ellipsis;
        word-wrap: break-word;
        /* 换行不截断单词 */
        /* word-break: break-all; */
    }
   
    /* 播放，收藏，分享按钮样式 */
   
    .songname .MV-vip-public {
        margin-left: 10px;
        width: 40px;
       height: 20px;
       color: #31c37c;
       line-height: 20px;
       text-align: center;
        border: 1px solid #2caf6f;
        border-radius: 4px;
    }
    .songname .MV a {
        color: #31c37c;
    }
    .play-feature {
       display: flex;
       justify-content: space-between;
       align-items: center;
        width: 160px;
      height: 50px;
        /* background-color: pink; */
    }

    .feature-public {
        width: 46px;
        height: 46px;
        background-color: #31c37c;
        border-radius: 23px;
    }
        .introduce {
       /* 允许长单词换行 */
        word-wrap: break-word;
        /* 换行不截断单词 */
        word-break: break-all;
        position: relative;
        top: -50px;
        left: 1000px;
        width: 290px;
        /* background-color: pink; */
    }
    </style>
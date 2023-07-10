<template>
    <div class="songlist-head" >
                 <ul v-for="(item,index) in songListDetail.songlist" :key="index" @mouseover="showa(index)" @mouseleave="hidea(index)">
                     <div class="occupation">{{ index+1 }}</div>
                     <li class="special">
                             <div class="songname">
                                     <!-- 这里的路由写成声明式的原因是，params里的变量已经有值了，不会出现params缺失的情况，缺失不是指没有，如果在路由初始化之前parans还没有值，依然会报缺失的错误 -->
                                 <div class="songname-container"><router-link :to="{ name:'song-details',params:{mid:item.songmid}}" >{{ item.songname }}</router-link></div>
                                 <div class="album-desc songname-container">{{ item.albumdesc }}</div>
                                 <div class="MV MV-vip-public" v-if="item.vid==0?false:true"><router-link to="">MV</router-link></div>
                                 <div class="vip MV-vip-public" v-if="item.pay.payplay==0?false:true">VIP</div>
                            </div> 
                             <div class="play-feature" v-if="activeIndex===index">
                                     <div class="play feature-public" >
                                         <!-- <router-link target="_blank" :to="{name:'song-play'}"><span class="iconfont icon-bofang"></span></router-link> -->
                                         <a href="#" target="_blank"  @click="(event)=>openPlaylistInNewTab(index,event)">
                                         <span class="iconfont icon-bofang"></span>
                                         </a>
                                     </div>
                                     <div class="add feature-public">
                                         <span class="iconfont icon-tianjia"></span>
                                     </div>
                                     <div class="download feature-public" v-if="!item.pay.payplay">
                                         <span class="iconfont icon-icon-test"></span>
                                     </div>
                                     <div class="share feature-public" v-if="!item.pay.payplay">
                                         <span class="iconfont icon-fenxiang"></span>
                                     </div>
                             </div>
                      </li>
                     <li><router-link to="" v-for="i in item.singer">{{ i.name }}&nbsp</router-link></li>
                     <li><router-link to="">{{ item.albumname }}</router-link></li>
                     <li>{{ item.interval }}</li>
                 </ul>
       </div>
 </template>
 <script setup>
 import { useRouter } from 'vue-router';
 import { ref} from 'vue';
 
 import {userToBePlayedStore} from '../../store/toBePlayed'
 import { useSongListDetailStore } from '../../store/songlistDetail';
 const toBePlayedStore=userToBePlayedStore()
 const songListDetail=useSongListDetailStore()
 const router = useRouter()
 
 
 
     const activeIndex=ref(-1)
 function showa (index){
     activeIndex.value=index
     
 }
 function hidea (index){
     activeIndex.value=-1
     
 }
 
       const playerWindow = ref(null)
 const openPlaylistInNewTab = async(idx, event) => {
     // 这句代码至关重要！！！！！因为songplay组件是属于新窗口，此时状态管理不会共享状态，每个窗口的数据变化是不互通的，因此songplay中删除了歌曲，修改了tobeplayedstore的数据，
     // 但是不会影响playlist的tobeplayedstore数据，所以会出现歌曲删了之后，当添加新歌曲时又恢复已删除歌曲的情况。简单一点说就是，原标签页面打开一个新标签，添加了5首歌，
     // 新标签怎么删除歌曲也不会影响原标签的tobeplayedstore里的数据，当继续添加歌曲时，即又打开一个新页面（我做了处理不继续新开窗口，但本质上只要不在原标签上打开，就算作新开窗口）
     // 会把tobeplayedstore的数据赋给新标签的tobeplayedstore，因此新标签页面修改的内容需要及时同步到原标签，这里选择使用本地存储这就是跨窗口通信，更多请搜索了解
     toBePlayedStore.song=JSON.parse(localStorage.getItem("toBePlayedSongs")) || []  
 
 
     toBePlayedStore.tobeplay(idx);   //idx为歌曲所在序列位置，传入后用于获取这首歌的相关所需信息
     // 测试歌曲是否存入song数组----console.log(toBePlayedStore.song);
   
     event.preventDefault();
 
     const route = router.resolve({ path: '/song-play' });
 
     if (playerWindow.value === null || playerWindow.value.closed) {
         // 如果没有已打开的播放器窗口，或者窗口已关闭，那么就打开一个新窗口,注意这里延迟0.1秒打开，因为数据太多可能还没有请求到，添加一首没这个问题
         
             playerWindow.value = window.open(route.href, 'myPlayerWindow');
        
        
         // 测试代码：添加歌单后，此时窗口已打开，但是添加一首歌依然进入if分支
         // console.log('进入if');
     } else {
         // 如果播放器窗口已经打开，那么就在已有窗口中更新 URL
         playerWindow.value.location.href = route.href;
         playerWindow.value.focus();
     }
     // 一个小bug，歌单整个加入后，如果再添加一首不会刷新列表，暂时没找到原因，用以下代码二次刷新.后续：bug写在了playlistItem里
     
     playerWindow.value.location.reload();
     
 };
 
 
 </script>
     
 <style scoped>
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
     .songlist-head ul:nth-of-type(n) {
         background-color:#f7f7f7;
     }
     .songlist-head ul:nth-of-type(2n) {
         background-color:#fafafa;
     }
     /* 这里容易选择器权重错误 */
     /* 控制歌名盒子长度 */
     .songlist-head ul li:nth-of-type(1) .songname {
         display: flex;
         
         align-items: center;
         width: 270px;
         height: 50px;
         /* background-color: lightblue; */
         
     }
    
    .album-desc {
     overflow: hidden;
         text-overflow: ellipsis;
         word-wrap: break-word;
     color: #999999;
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
         /* 这句样式非常有用，可以让元素右对齐而不脱标，但是原理有点复杂，记得去了解bfc */
         margin-left: auto; 
         justify-content: flex-end;
         align-items: center;
         width: 190px;
         height: 50px;
         /* background-color: pink; */
         
     }
 
     .feature-public {
         display: flex;
         justify-content: center;
         line-height: 46px;
         width: 46px;
         height: 46px;
         /* background-color: lightblue; */
         border-radius: 23px;
     }
     .feature-public span {
         font-size: 40px;
         
         color: #a2a2a2;
     }
     .feature-public span:hover {
         color: #31c27c;
     }
     .download span {
         font-size: 36px;
         
     }
     .share span {
         font-size: 40px;
     }
 </style>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    headline:{
        type:String,
        required:true
    },
    
    singerName:{
        required:true
    },
    imgUrl:{
        required:true
    }
})

// 由于歌单创建者名字是字符串，而歌手又是以数组存储的，故这里统一以数组形式存储
let newNameArr=props.singerName
console.log(props.singerName);
console.log(typeof(props.singerName));
if(typeof(props.singerName)=='string')
{
    console.log(typeof(props.singerName));
    newNameArr=[props.singerName]
}
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
        
            console.log(11111);
            playerWindow.value.focus();
            
        }
        
        playerWindow.value.location.reload();
   }
</script>

<template>
    <div class="mod-data">
            <div class="data-cover">
                <img :src="imgUrl" alt="">
            </div>
            <div class="data-details">
                <div class="data-title">{{headline }}</div>
                <div class="data-singer"><span class="iconfont icon-renyuan-05"></span>
                    <slot name="singerName"></slot>
                    <router-link to="" v-for="item in newNameArr">{{ item }}</router-link>
                </div>
                <div class="data-info">
                    <slot name="info"></slot>
                </div>
                
                <div class="toolbar">
                    
                    <slot name="jumpPlay"></slot>
                    <slot name="jumpPlayAll"></slot>
                    <slot name="intelligentJudge"></slot>
                    <div class="public-size"><span class="iconfont icon-aixin"></span> 收藏</div>
                    <div class="public-size"><span class="iconfont icon-pinglun"></span>评论</div>
                    <div class="public-size"><span class="iconfont icon-gengduo"></span>更多</div>
                </div>
            </div>
        </div>
</template>

<style scoped>
.mod-data {
        margin: 50px 0px;
        display: flex;
       justify-content: space-between;
        height: 280px;
        /* background-color: aquamarine; */
    }
    .data-cover {
        width: 280px;
        height: 280px;
        /* background-color: burlywood; */
    }
    .data-cover img {
        width: 100%;
        height: 100%;
    }
    .data-details {
        
       
        width: 960px;
        height: 280px;
        /* background-color:lightblue */
    }
    .data-singer {
        font-size: 18px;
        margin-bottom: 10px;
    }
   
    .data-singer span {
        font-size: 20px;
        margin-right: 5px;
    }
    
    .data-title {
        margin: 20px 0px;
        font-size: 30px;
        font-weight: normal;
    }
    .toolbar {
        display: flex;
        margin-top: 15px;
        /* width:560px; */
        height: 45px;
       /* background-color: pink; */
        
    }
    .public-size {
        display: flex;
        margin-right: 10px;
        width: 135px;
        height: 45px;
        /* background-color: bisque; */
        justify-content: center;
        align-items: center;
        border: 1px solid #c9c9c9;
        border-radius: 3px;
    }
    /* 注意这里样式顺序不能换 */
    .public-size:nth-last-of-type(n){
        cursor:pointer;
    }
    .public-size:nth-last-of-type(n):hover {
        background-color: #ededed;
    }
    

</style>
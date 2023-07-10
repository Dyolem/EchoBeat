<script setup>
import { computed, ref, watch, } from "vue";
import { useRouter } from "vue-router";
import { useLyrics } from "../../store/lyrics";
import { useSongPlayLink } from "../../store/songPlayLink";
import DetailsTemplate from "../detailsTemplate.vue";


const router=useRouter()
// 点击歌曲后新建一个窗口展示歌曲详情页面
const toSongDetalisPage=(mid)=>{
    let routeData=router.resolve({
        // 两种写法都可以
        // path:'/song-details/'+lyrics.mid,
        name:'song-details',
        params:{mid:lyrics.mid}
        
    })
    console.log(routeData.href);
    window.open(routeData.href,'_blank')
}

const songPlayLink= useSongPlayLink()
const lyrics= useLyrics()
const midLyricsRef=ref(null)
    // 使用computed是因为lyrics中的数据是异步请求，肯定会比组件加载更慢，因此即使加载的时候没有请求完，后面请求到了也会及时更新
    // 注意不要log打印检查，这是一个陷阱，因为不循环或者再次打印，第一次打印肯定是为空的，即使请求完成了，由于js顺序执行，也不会再打印了
    const activeTime=computed(()=>{
        return lyrics.songLyrics.map(item=>item.time/1000)
    })
    

    // 获取当前播放歌词次序逻辑：由于currentTime是不断变化的，可以根据一句歌词的起始播放时刻减去currentTime的绝对值小于0.3来判断
    // 是否播放进度已到达目标歌词的起始时刻附近，若是则返回该句歌词索引，模板依据索引指定渲染歌词颜色、
    // 设置0.3这个值的原因是currentTime是接近0.25秒更新一次，这是打印测试发现的。因此设置值的选取需要考虑两个问题：
    // 1、设置值小于0.25.假如设置为0.1，currentTime现在为10，而第5句歌词起始为第10.15秒，相减发现0.15不小于0.1，
    // 而10.25秒时，0.2也不小于0.1，这样就导致查找错误，漏掉了这句歌词，因此设置值不能过小。
    // 2、设置值不能过大，如果过大，比如设置1，当几句歌词时刻很接近时，就会出现几个都匹配的情况，
    // 顺序查找会返回第一个匹配的值，二分查找会返回最后一个值


    // 算法优化：当手动拖动进度条，即大幅度改变歌曲进度（currentTime）顺序查找将会很慢，比如进度条拖动到末尾结束部分，
    // 而总歌词有100条，如果顺序查找，则至少匹配90多条歌词的起始时刻，实际体验就是视觉上会发现过了一两秒之后歌词才渲染颜色
    // 为了解决这个问题，将findIndex优化成二分查找，能迅速定位到歌词的次序，最后实际体验降低至一秒之内。
    // 还有一种解决办法是等歌词次序找到之后再播放歌曲，但是有两个问题，一是播放代码需要额外修改，比较麻烦，
    // 二是即使修改，最后又变成了听觉延迟了，跳转进度条之后，需要等着找到歌词次序才能播放。所以后续完善也以优化查找算法为主

    // 算法一
    // const lastIndex=ref(0)
    // const lyricsIndex=computed(()=>{
        
    //   let index = activeTime.value.findIndex((item)=>Math.abs(item-songPlayLink.currentTime)<0.3)
    //     if(index!=-1)
    //     {
    //         lastIndex.value=index
    //     }
       
    //     if(index==-1)
    //     {
    //         index=lastIndex.value
    //     }
    //     return index
    // })

    // 算法二：
    const lastIndex=ref(0) //当未找到匹配歌词时，保持上一句歌词的索引，这样就可实现歌词颜色变绿至下一句歌词
    const lyricsIndex = computed(() => {
        let left = 0;
        let right = activeTime.value.length - 1;
        let index = -1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const currentTime = songPlayLink.currentTime;
            const diff = Math.abs(activeTime.value[mid] - currentTime);

            if (diff <= 0.3) {
            index = mid;
            break;
            } else if (activeTime.value[mid] < currentTime) {
            left = mid + 1;
            } else {
            right = mid - 1;
            }
        }
                if(index!=-1)
                {
                    lastIndex.value=index
                }
            
                if(index==-1)
                {
                    index=lastIndex.value
                }
        
        // console.log(index);
        return index;
    });
    watch(lyricsIndex,()=>{
    //     console.log(activeTime.value);
    //     console.log(songPlayLink.currentTime);
    //   console.log(lyricsIndex.value);
    // 如果未在拖动状态，则更新歌词状态
        if(!isDragging.value)
        midLyricsRef.value.scrollTop=lyricsIndex.value*30
    
    })


   // 以下是一个局部注册的指令，用于带有滚动条的盒子除了使用鼠标滚动以外，添加了拖动滚动功能
    const isDragging=ref(false)
    const vDrag = {
        //固定写法mounted，不是写成onMounted，因为这是指令自己的生命周期，与组件略有不一
        mounted(el) {
            // 用于计算鼠标移动距离的两个变量
            let startPosition = 0;
            let startScrollPosition = 0;
            // 最后一次鼠标弹起后，用于计时，超过4秒会更新到最新歌词位置
            const miniSecond=ref(0)
            // 定时器接收变量
            let waitDragging=null
            el.addEventListener('mousedown', handleDragStart);

            function handleDragStart(event) {
                // 如果两次拖动时间间隔未超过4秒，需要将上一次拖动弹起后的计时重置为0，因为miniSecond定义为最后一次拖动弹起后的计时
                miniSecond.value=0
                if(waitDragging!==null)
                clearInterval(waitDragging)
                // 监听document而不是el的原因是，用户大多数情况都会在拖动时拖出el元素范围，
                // 而超出后会出现逻辑错误，这里不再赘述，playControl有同样问题，并且解释的更清晰
                document.addEventListener('mousemove', handleDrag);
                isDragging.value = true;
                startPosition = event.clientY;
                startScrollPosition = el.scrollTop;
            }
        
            function handleDrag(event) {
                document.addEventListener('mouseup', handleDragEnd);
                if (!isDragging.value) return;
        
                const deltaY = event.clientY - startPosition;
                el.scrollTop = startScrollPosition - deltaY;
            }
        
            function handleDragEnd() {
                
                document.removeEventListener('mousemove', handleDrag);
                waitDragging=setInterval(()=>{
                    miniSecond.value+=50
                },50)
                watch(miniSecond,()=>{
                    // console.log(miniSecond.value);
                    if(miniSecond.value==4000)
                    {
                    isDragging.value = false;
                    clearInterval(waitDragging)
                    }
                })
            }  
    },
    unmounted(el) {
      el.removeEventListener('mousedown', handleDragStart);
      
      document.removeEventListener('mouseup', handleDragEnd);
    }
        
}

</script>

<template>
    <div class="mod-song-info">
        <div class="song-info">
            <div class="mid-box">
                <div class="img-container">
                    <img :src="`${songPlayLink.songCover}`" alt="" class="song-img">
                </div>
                <div class="info">
                    <div class="songname public" @click="toSongDetalisPage(lyrics.mid)">歌曲名：{{ songPlayLink.songName }}</div>
                    <div class="singer public" >歌手：<span v-for="item in songPlayLink.singerName">{{ item.name }}&nbsp;</span></div>
                    <div class="album public">专辑：{{ songPlayLink.albumname }}</div>
                </div>
            </div>
        </div>
        <div class="lyrics-container">
            <div class="mid-lyrics" ref="midLyricsRef" v-drag>
                <div class="lyrics-item" :class="lyricsIndex===index?'activeGreen' : ''" 
                v-for="(item,index) in lyrics.songLyrics" :key="index">{{ item.txt }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mod-song-info {
    display: flex;
    
    justify-content: center;
    flex-wrap: wrap;
   
    width: 100%;
    height: calc(70vh);
    /* background-color: antiquewhite; */
}
.song-info {
    display: flex;
    flex-wrap: wrap;
    justify-content:center;
   
    width: 100%;
    height: 300px;
    /* background-color: pink; */
}
.mid-box {
    display: flex;
    flex-wrap: wrap;
    width: 300px;
    justify-content: center;
}
.img-container {
    /* margin: 0px auto; */
    position: relative;
    width: 200px;
    height: 200px;
    /* background-color: lightblue; */
}
.img-container::after {
    content: '';
    position: absolute;
    left: 23px;
    top: 2px;
    width: 201px;
    height: 200px;
    /* 原链接：https://y.qq.com/ryqq/static/media/album_cover_player.8dfd80d6.png?max_age=2592000 */
    background: url('../../assets/img/album_cover_player.8dfd80d6.png') 0 0 no-repeat;
}
.song-img  {
    width: 100%;
    height: 100%;
}
.info {
    text-align: center;
    width: 300px; 
    height: 80px;
    /* background-color: bisque; */

}
.public {
    color: #b8b8b8;
    margin: 3px 0;
}
.public:hover {
    cursor: pointer;
    color: #fff;
}
.lyrics-container {
    width: 400px;
    /*使用calc时，如果有运算符号，加减号左右必须加空格，乘除无所谓，但最好也加上*/
    height: calc(70vh - 300px);
    cursor: grab;
    /* background-color: aqua; */
}
.mid-lyrics {
    position: relative;
   overflow: auto;
    margin: 0 30px;
    height: 100%;
    /* background-color: aquamarine; */
}
.mid-lyrics::-webkit-scrollbar {
    width: 0;
}
.mid-lyrics-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    
}
.lyrics-item {
    user-select: none;
    padding: 5px 0;
    
    text-align: center;
    color: #b8b8b8;
    /* transform: translateY(-100%); */
   
}
.activeGreen {
    color: #31c27c;
}
</style>


<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useLyrics } from "../store/lyrics";
import { useSongPlayLink } from "../store/songPlayLink";
import { userToBePlayedStore } from "../store/toBePlayed";
const toBePlayed = userToBePlayedStore()
const lyrics= useLyrics()
const songPlayLink=useSongPlayLink()

const router=useRouter()
// 点击歌曲后新建一个窗口展示歌曲详情页面
const toSongDetalisPage=(mid)=>{
    let routeData=router.resolve({
        // 两种写法都可以
        // path:'/song-details/'+lyrics.mid,
        name:'song-details',
        params:{mid:lyrics.mid}
        
    })
    window.open(routeData.href,'_blank')
}


const parcelPos = ref(null);
const startDragging = (e) => {
  document.addEventListener("mousemove", dragging);
};

const dragging = (e) => {
    // 这里加上弹起事件的原因是，如果鼠标一直不弹起，并且已经滑出了进度条盒子的范围，此时若弹起，
    //会导致浏览器认为鼠标依然没有弹起，仍然保持在按下状态，并且此时也控制不了进度条移动了，而当下次光标经过进度条时，不用点击，
    // 只要移动就会移动进度条，因为浏览器认为你还是按压状态，所以可以拖动。解决办法就是在整个页面也监听弹起事件，
    // 另外这个全局监听要放dragging里，不然会影响页面中其他元素的弹起事件
    // 触发这个bug的方式有两种，第一种是，物理bug，鼠标按下给浏览器按下事件，但是不知道怎么回事，物理硬件上鼠标弹起来了，但是不会触发弹起事件
    // 第二种是页面中有些元素不可选中挪动，由于是按压状态，和复制选中操作一样，因为复制选中就是先按压再弹起，此时浏览器会自动结束，
    // 光标会成为一个禁止标志，而一旦成为这个标志，鼠标如果不弹起，它不会消失，一弹起，浏览器判定鼠标还是按下状态，就触发bug了
    // 第二种还没解决
    document.addEventListener("mouseup", endDragging);
    // requestAnimationFrame可要可不要
    requestAnimationFrame(() => {
      const parentWidth = parcelPos.value.parentNode.getBoundingClientRect().width;
      const offsetX = (e.clientX - parcelPos.value.getBoundingClientRect().left) / parentWidth;
      if(offsetX<=1)
      {
        parcelPos.value.style.width = `${offsetX * 100}%`;
        songPlayLink.audio.currentTime=offsetX*songPlayLink.audio.duration
        console.log('suc');
      }
   
    else
    {
    parcelPos.value.style.width = '100%';
   
    }
      
    });
  }


const endDragging = (e) => {
  
  document.removeEventListener("mousemove", dragging);
  requestAnimationFrame(() => {
    const parentWidth = parcelPos.value.parentNode.getBoundingClientRect().width;
    const offsetX = (e.clientX - parcelPos.value.getBoundingClientRect().left) / parentWidth;
    if(offsetX<=1)
    {
        parcelPos.value.style.width = `${offsetX * 100}%`;
        songPlayLink.audio.currentTime=offsetX*songPlayLink.audio.duration
    }
    
    else
    {
    parcelPos.value.style.width = '100%';
    }
  })
  document.removeEventListener("mouseup", endDragging);
};


// 监听currentTime变化改变进度条
const ratio=ref(0)
watch(()=>songPlayLink.currentTime,(newVal,oldVal)=>{
    ratio.value=newVal/songPlayLink.audio.duration
    parcelPos.value.style.width = `${ratio.value * 100}%`;
})



// 播放暂停切换的逻辑代码
const togglePlay=()=>{
    if(songPlayLink.playFlag)
       {
           songPlayLink.audio.pause()
            songPlayLink.playFlag=false
       }
       else if(songPlayLink.playFlag==false)
       {
            
            songPlayLink.audio.play()
            songPlayLink.playFlag=true
            // console.log('suc');
       }
    //    console.log(songPlayLink.playFlag);
}

// 随机播放模式
const randomPlay = ()=>{
    let randomIndex= getRandomIntInclusive(0,toBePlayed.song.length-1)   //记得减一，因为歌曲序号从0开始
        songPlayLink.fetchSongPlayLink(randomIndex)
        lyrics.fetchLyrics(JSON.parse(localStorage.getItem("toBePlayedSongs"))[randomIndex].mid)
        // songPlayLink.fetchSongCover(randomIndex)
        songPlayLink.playIndex=randomIndex
        
}
// 列表循环和顺序循环公共代码
const commonCycle=(num)=>{
    songPlayLink.playIndex=(songPlayLink.playIndex+num)%toBePlayed.song.length  //这句代码实现了第一首歌和最后一首歌首尾相连，其中num是关键，具体作用自行理解
        // 还有一个需要注意的点，songplay组件里的那个gif需要playIndex判断，因此playIndex只能重新赋值，不能用其他变量代替
    console.log(songPlayLink.playIndex);
    songPlayLink.audio.pause()
    songPlayLink.fetchSongPlayLink(songPlayLink.playIndex)
    lyrics.fetchLyrics(JSON.parse(localStorage.getItem("toBePlayedSongs"))[songPlayLink.playIndex].mid)
    // songPlayLink.fetchSongCover(songPlayLink.playIndex)
}
// 写随机的必要代码，此代码可以放至工具函数里
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值
}

// 上一首和下一首歌曲的控制代码。由于不同播放模式下的下一首上一首逻辑都不一样，因此分支写在这里面是最简洁的
const preAndLastSong=(num)=>{
// 优化了前进后退播放代码，减少代码重复率。num为模板中传递的值，传的1代表下一首，而toBePlayed.song.length-1是动态值，用于上一首

    if((modeStyle.value[count.value].title=='列表循环'))
    {
        commonCycle(num)
    }
    else if((modeStyle.value[count.value].title=='随机播放'))
    {
        songPlayLink.audio.pause() //加这句代码是用于上一首歌曲还未播放完时切换下一首，需要及时结束上一首，不然两首歌会一起播放。
        randomPlay()
    }
    else if((modeStyle.value[count.value].title=='单曲循环'))
    {      
        togglePlay()
    }
    else if ((modeStyle.value[count.value].title=='顺序循环'))
    {
        // 当最后一首歌时，不可以再播放下一首，但是可以播放前一首，因此这里关闭下一首的逻辑，但是保留播放上一首的功能
        if(songPlayLink.playIndex==toBePlayed.song.length-1&&num==1)
        return
        commonCycle(num)
    }
}
// 上一首
//由于以下三个请求是互相独立的，下一个请求不需要前一个请求的结果作为参数，
//所以这里选择异步，不添加async和await，这样能更快获取歌词封面和播放链接
// const preSong= ()=>{
//     songPlayLink.audio.pause()
//     songPlayLink.fetchSongPlayLink(songPlayLink.playIndex-1)
//     lyrics.fetchLyrics(songPlayLink.playIndex-1)
//     songPlayLink.fetchSongCover(songPlayLink.playIndex-1)
    
//    songPlayLink.playIndex--
   
   
// }
// // 下一首
// const lastSong= ()=>{
//     if((modeStyle.value[count.value].title=='列表循环'))
//     {
//         songPlayLink.playIndex=(songPlayLink.playIndex+1)%toBePlayed.song.length
        
//         console.log(songPlayLink.playIndex);
//         songPlayLink.audio.pause()
//         songPlayLink.fetchSongPlayLink(songPlayLink.playIndex)
//         lyrics.fetchLyrics(songPlayLink.playIndex)
//         songPlayLink.fetchSongCover(songPlayLink.playIndex)
        
        
        
        
//     }
//     else if((modeStyle.value[count.value].title=='随机播放'))
//     {
//         songPlayLink.audio.pause() //加这句代码是用于上一首歌曲还未播放完时切换下一首，需要及时结束上一首，不然两首歌会一起播放
//         randomPlay()
//     }
//     else if((modeStyle.value[count.value].title=='单曲循环'))
//     {      
//             togglePlay()
//     }
    
   
   
// }


    
// 由于歌曲实例在store里不能直接监听，只能监听store中的ended值判断歌曲是否播放完毕
// 自动播放下一首的逻辑抽象出来就是调用preAndLastSong，这样能最大简化代码.
// 另外除了歌曲自动播放完会触发这里的代码，删除正播放歌曲也会触发，因为删除后改变了ended的值
watch(()=>songPlayLink.ended,(newVal,oldVal)=>{
if(newVal)
{
    console.log(111);
    songPlayLink.playFlag=false
    preAndLastSong(1)  //记得传递1
    // 记得把ended状态改回false，不然只会顺序播放一首
    songPlayLink.ended=false
    // console.log('suc');
}
})



const count=ref(0) //第几种播放模式
const modeStyle=ref([])
// 赋值记得放在onmounted之外，不然模板渲染获取不到数据
modeStyle.value=[
        {
            fontClass:'icon-24gl-repeat2',
            title:'列表循环'
        },
        {
            fontClass:'icon-24gl-repeatOnce2',
            title:'单曲循环'
        },
        {
            fontClass:'icon-xunhuan',
            title:'随机播放'
        },
        {
            fontClass:'icon-tubiaozhizuomoban-17',
            title:'顺序循环'
        }
    ]
    // 页面首次加载时，从浏览器获取上次播放模式状态,若没有则设为第一种默认模式
    if(JSON.parse(localStorage.getItem('playmode'))==null)
    {
        count.value=0
        localStorage.setItem('playmode',JSON.stringify(modeStyle.value[count.value].title))
    }

    // console.log(JSON.parse(localStorage.getItem('playmode')));
    // 页面首次加载或刷新时，从浏览器获取上次播放模式状态,若没有则设为第一种默认模式
    // 若有，则通过switch读取存储的数据

   
    count.value=modeStyle.value.findIndex((item)=>item.title==JSON.parse(localStorage.getItem('playmode'))) //优化后的代码
    // switch(JSON.parse(localStorage.getItem('playmode')) ){
    //     case'listLoop':
    //         count.value=0
            
    //         break
    //     case'singleCycle':
    //         count.value=1
           
    //         break
    //     case'randomPlay':
    //         count.value=2
            
    //         break
    //     case'sequentialCycle':
    //         count.value=3
            
    //         break    
    // }



    // 改变播放模式，修改存储的模式
const modifyMode=()=>{
    count.value++
    if(count.value>3)
    {
        count.value=0   
    }
    localStorage.setItem("playmode",JSON.stringify(modeStyle.value[count.value].title))  //优化后代码
    // else
    // {
        
    //     if(count.value==1)
    //     {
    //         playMode.value='单曲循环'
    //         localStorage.setItem("playmode",JSON.stringify(playMode.value))
            
            
    //     }
    //     else if(count.value==2)
    //     {
    //         playMode.value='随机播放'
    //         localStorage.setItem("playmode",JSON.stringify(playMode.value))    
           
    //     }
    //     else if(count.value==3)
    //     {
    //         playMode.value='顺序循环'
    //         localStorage.setItem("playmode",JSON.stringify(playMode.value)) 
            
    //     }
    // }
}



// watch(()=>playMode.value,(newVal,oldVal)=>{

//     switch(newVal){
//         case'listLoop':
//             modeStyle.value= 'icon-24gl-repeat2'
//             break
//         case'singleCycle':
//             modeStyle.value= 'icon-24gl-repeatOnce2'
//             break
//         case'randomPlay':
//             modeStyle.value= 'icon-xunhuan'
//             break
//         case'sequentialCycle':
//             modeStyle.value= 'icon-tubiaozhizuomoban-17'
//             break
//         }    
// })

</script>

<template>
    <div class="controls-container">
        <div class="controls">
            <div class="pre-song public-control ">
                <span class="iconfont icon-diyiyeshouyeshangyishou" @click="preAndLastSong(toBePlayed.song.length-1)"></span>
            </div>
            <div class="toggle-play public-control ">
                <span class="iconfont " :class="songPlayLink.playFlag? 'icon-ai07':'icon-24gf-play'"
                 @click="togglePlay()"></span>
            </div>
            <div class="last-song public-control ">
                <span class="iconfont icon-zuihouyiyemoyexiayishou" @click="preAndLastSong(1)"></span>

            </div>
                
        </div>
        <div class="progress-bar-container">
            <div class="song-info">
                <div class="song-title">
                    <div class="songname" @click="toSongDetalisPage(songPlayLink.mid)">{{songPlayLink.songName}}</div>
                    <span>-</span>
                    <div class="singer"><span v-for="(item,index) in songPlayLink.singerName">{{ item.name }}</span></div>
                </div>
                <div class="time">{{ `${songPlayLink.formattedCurrentTime}/${songPlayLink.formattedDuration}` }}</div>
            </div>
            <div class="enlarge-click" @mousedown="startDragging"  @mouseup="endDragging">
                <div class="progress-bar" >
                        <div class="progress-bar-mask" ref="parcelPos" >
                            <div class="mark"></div>
                        </div>    
                </div>
            </div>
        </div>
        <div class="feature-set">
            <div class="play-mode public-size iconfont " :class="modeStyle[count].fontClass" :title="modeStyle[count].title" @click="modifyMode"></div>
            <div class="collect public-size iconfont icon-aixin" ></div>
            <div class="download public-size iconfont icon-xiazai"></div>
            <div class="comment public-size iconfont icon-pinglun"></div>
            <div class="pure-play iconfont"></div>
            <div class="sound-controls iconfont"></div>
        </div>
    </div>
</template>

<style scoped>
.controls-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;

    bottom: 1px;
    left: 50%;
    
    width: 90%;
    height: 100px;
    /* background-color: pink; */
    transform:translateX(-50%)
}
.controls {
    display: flex;
    width: 200px;
    justify-content: space-between;
}
.public-control {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    /* background-color: lightblue; */
    cursor: pointer;
}
.iconfont {
        font-size: 50px;
        color: #e8e7e6;
}
.toggle-play .iconfont {
    font-size: 40px;
}
.iconfont:hover {
    color:#ffffff;
}

.progress-bar-container{
    flex-grow: 1;
    margin: 0 20px;
    height: 50px;
    /* background-color: aquamarine; */
}



.feature-set{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 350px;
    height: 50px;
    /* background-color: coral; */
}

.song-info {
    display: flex;
    justify-content: space-between;
}
.song-title {
    display: flex;
    flex-grow: 1;
    height: 30px;
    /* background-color: gold; */
}
.song-title span {
    margin: 0 5px;
    color: #e8e7e6;
}
.songname  {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #e8e7e6;
}
.songname:hover {
    cursor: pointer;
    color: #fff;
}
.singer {
    color: #e8e7e6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.singer span:hover {
    cursor: pointer;
    color: #fff;
}
.time {
    height: 30px;
    color: #e8e7e6;
    /* background-color: antiquewhite; */
}

/* 扩大进度条上下滑动范围，优化用户操作体验 */
.enlarge-click {
    display: flex;
    align-items: center;
    height: 16px;
    /* background-color: black; */
}
.progress-bar {
 
    flex-grow: 1;
    height: 3px;
   
    background-color: gray;
}
.progress-bar-mask {
    position: relative;
    /* 由于设置了盒子宽度随视窗放大缩小变化，所以这里不能用px */
    width: 0%;
    height: 3px;
    background-color: #fff;
}

.mark {
    position: absolute;
    left: 100%;
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius:5px;
    transform:translate(-5px,-3px)
   
}

.public-size {
    width: 30px;
    height: 30px;
    /* background-color: lightblue; */
    font-size: 30px;
}
.comment:hover {
    color: #45b980;
}
.pure-play {
    width: 70px;
    height: 50px;
    /* background-color: blueviolet; */
}
.sound-controls {
    width: 70px;
    height: 50px;
    /* background-color: blueviolet; */

}
</style>
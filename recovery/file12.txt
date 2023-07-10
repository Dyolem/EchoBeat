

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

import playControls from '../playControls.vue'
import imgLyrics from './imgLyrics.vue'
import {useSongPlayLink} from '../../store/songPlayLink'
import { useLyrics } from "../../store/lyrics";
import { userToBePlayedStore } from "../../store/toBePlayed"

const router=useRouter()

// 点击歌曲后新建一个窗口展示歌曲详情页面
const toSongDetalisPage=(mid)=>{
    let routeData=router.resolve({
        path:'/song-details/'+mid,
        
    })
    window.open(routeData.href,'_blank')
}


const songPlayLink=useSongPlayLink()
const lyrics=useLyrics()
const toBePlayed=userToBePlayedStore()


const activeIndex=ref(-1)
const bacimage=ref(null)



function showa (index){
    activeIndex.value=index
    
}
function hidea (index){
    activeIndex.value=-1
    
}

// 收藏歌曲爱心颜色控制
const collectionRefs=ref(null)

function collectSongs(params) {
    // 用if判断颜色
    if(collectionRefs.value.style.color=='rgb(240, 104, 104)')
   {
    collectionRefs.value.style.color='#fff'
    return
   }
    console.log(collectionRefs.value.style.color);
    collectionRefs.value.style.color='rgb(240, 104, 104)'
    console.log(collectionRefs.value.style.color);
    
}





const checkedSongArray=ref([])  //获取勾选中的歌曲的索引值，用一个数组囊括
const allCheckedRef=ref(null)   //获取全选的元素dom
const checkboxRefs=ref([])      //获取所有歌曲勾选状态元素的dom

// 全选状态逻辑
function checkedAllSongs (){
    // 这里有个陷阱，当调用该方法时，虽然checked属性会变化，但是实际发现变化慢于下面的分支代码的执行，因此首次点击会出现进入else分支的情况
    // 验证：可以将分支代码全部放在一个延时器里，延迟执行，发现又进入if分支了，
    // 说明的确是checked属性还未改变时就执行分支代码了。因此这里需要监听checked值的变化
// 这里只能使用原生监听，因为input的checked属性是原生属性，watch并不能监听变化
    allCheckedRef.value.addEventListener('change',()=>{
        if(allCheckedRef.value.checked)
        {
            checkedSongArray.value=[]
            for (let i = 0; i < toBePlayed.song.length; i++) {    
                checkedSongArray.value.unshift(i)   //头部插入的原因是保持数组是降序排列，降序原因下面有
                checkboxRefs.value[i].checked=true
            }
        }

        else
        {
            checkedSongArray.value=[]
            for (let i = 0; i < toBePlayed.song.length; i++) {
                
                checkboxRefs.value[i].checked=false
                
            }
            console.log(checkedSongArray.value);
        }
        
    })  
}

// 勾选歌曲逻辑，处理checkedSongArray数组包含的索引值
function checkedSongs (index){
    if(allCheckedRef.value.checked)
    allCheckedRef.value.checked=false

    let checkedIndex= checkedSongArray.value.findIndex((item)=>item===index)
    if(checkedIndex!=-1)
    {
        checkedSongArray.value.splice(checkedIndex,1)
        console.log(checkedSongArray.value);
        return
    }
    checkedSongArray.value.push(index)  //先无脑放入数组，下面再降序排序
    checkedSongArray.value.sort(function(a,b){
        return b-a
    })
    console.log(checkedSongArray.value);
  
}

// 顶部删除按钮的逻辑
function deleteSongs (){
    
    checkedSongArray.value.forEach(index=>{
       
        checkboxRefs.value[index].checked=false
        toBePlayed.deleteCurrentSong(index)   //删除歌曲是调用的toBePlayed里的方法。思考一个问题，如果checkedSongArray数组里的元素不是降序的
        // 那么正常的从0开始删会导致一个问题，比如删除第2首歌，索引为1，接着我们打算删第3首歌，索引应该为2，此时由于第2首歌没有了，第3首歌到了第2首歌的位置，
        // 第4首歌占了第3首歌的位置，由于给的删除索引就是2，所以实际是删除第4首歌去了。总结以上就是：前一个元素消除后，导致后面所有元素索引值都要变化，
        // 因此我们直接从后往前删，就避免了这个问题，保持checkedSongArray降序排列就是这个原因
    })
    checkedSongArray.value=[]
}

// 从垃圾桶删除歌曲的逻辑，涉及到直接删除和勾选中歌曲删除。直接删除很简单，调用toBePlayed里的删除方法即可
// 而勾选中再删除需要保证勾选标志随删除歌曲一并消失，同时其他勾选中但未删除的歌曲的勾选标志不消失
// 逻辑有点复杂，简单来说就是一首歌删除后会影响后面歌曲次序，需要及时修改checkedSongArray里的值
function delBucket (index) {
    // console.log(index);
    checkboxRefs.value[index].checked=false
    if(checkedSongArray.value.length!=0)
    {
            let pos =checkedSongArray.value.findIndex(item=>item==index)
            if(pos>0)
            {
                for (let i = 0; i < pos; i++) {
                checkedSongArray.value[i]--
                }
            }
            checkboxRefs.value[checkedSongArray.value[0]+1].checked=false
            checkedSongArray.value.splice(pos,1)
            
            
            checkedSongArray.value.forEach(item=>{
            
                checkboxRefs.value[item].checked=true
                
            })
    }
    console.log(checkedSongArray.value);
    toBePlayed.deleteCurrentSong(index)

}


// 实现歌曲正在播放的跳动标志：这个比较简单，直接模板中设置两个条件，是否处于播放状态并且播放索引为当前循环歌曲索引
// 第二个条件是避免所有循环项是同一个状态。至于原来歌曲的序号，直接用图片隐藏盖住就行，但是实际发现需要修改很多样式，
// 因此这里采用js方法，修改内容
// 这里需要仔细分析实现跳动的逻辑：最直接的逻辑，playFlag为真则在播放，
// 因此一共有两种大情况：1、同一首歌曲切换暂停播放.2、不同歌曲切换暂停播放
// 提取公共逻辑发现，不同歌曲切换时，下一首歌曲必定是播放状态，所以监听两个数据，任意一个触发便执行里面逻辑
const songNumRefs=ref([])
watch([()=>songPlayLink.playFlag,()=>songPlayLink.playIndex],(newVal,oldVal)=>{
   console.log(oldVal,newVal);
    // 如果切换不同歌曲，则恢复上一首歌曲的序号
    if(newVal[1]!=oldVal[1])
   {
    // 由于删除列表第一首歌时，playIndex减一了，就成了-1，然而数组索引不能越界小于0，但是删除这首歌后播放下一首，playIndex又会加1变成0，
    // 所以这里先提前设为0
    if(newVal[1]==-1)
    newVal[1]=0
    // 加一的原因是序号以1开头，数组是以0，以下同理
        songNumRefs.value[oldVal[1]].textContent=oldVal[1]+1
        songNumRefs.value[newVal[1]].textContent=''
   }
//    如果同一首歌曲切换，则判断playFlag
   else if(newVal[1]==oldVal[1])
   {
        if(newVal[0]==true)
        {
            // 这里用oldVal[1]和newVal[1]都可，因为同一首歌曲切换不改变playIndex
            songNumRefs.value[newVal[1]].textContent=''
            // songNumRefs.value[oldVal[1]].textContent=''
        }
        else
        {
            songNumRefs.value[newVal[1]].textContent=newVal[1]+1
            // songNumRefs.value[oldVal[1]].textContent=newVal[1]+1
        }
   }
})


// 当挂载完成后，获取本地存储的歌曲数据，用于渲染模板

onMounted(() => {
   
    // 获取列表里的第一首歌曲链接，封面，歌词
    songPlayLink.fetchSongPlayLink(0)
    lyrics.fetchLyrics(JSON.parse(localStorage.getItem("toBePlayedSongs"))[0].mid)
    
        // 根据歌曲音频源变化，判断歌曲发生了切换,这个是最核心的判断！！！
        watch(()=>songPlayLink.src,async (newVal,oldVal)=>{

            bacimage.value.style.backgroundImage=`url(${songPlayLink.songCover})`
            
            const startPlayPromise= songPlayLink.audio.play()
            console.log('change');
            songPlayLink.playFlag=true
            
           
            if(startPlayPromise!==undefined)
            {
                startPlayPromise.catch(error=>{
                    console.log(error.name);
                    // 浏览器不支持页面刷新后自动播放的情况
                    if(error.name==="NotAllowedError"){
                        songPlayLink.playFlag=false
                        console.log(songPlayLink.playFlag);
                        alert('由于浏览器限制，歌曲无法自动播放，请手动点击。');
                    }
                    // 没有获取到音频链接的情况
                    else if(error.name==="NotSupportedError"){
                        songPlayLink.playFlag=false
                        console.log(songPlayLink.playFlag);
                    }
                })   
            }
            console.log(startPlayPromise);
            console.log(songPlayLink.playFlag);
            
        })       
});
//获取播放链接
// 点击某首歌获取这首歌的播放链接，而不是一次性获取这个表里的所有链接，
// 并且当前这首歌的链接也没有储存，下一首歌会覆盖原来的，刷新更会导致pinia数据消失，因此点击每一首歌都要请求，后续可以根据需要设计持久化化存储

function playsong(index){
     
    if(songPlayLink.playIndex!=index){
       
        songPlayLink.playIndex=index
        songPlayLink.audio.pause()
        // 这三个请求是相互独立没有联系的，因此不用考虑先后顺序，不用添加async和await
        songPlayLink.fetchSongPlayLink(index)
        bacimage.value.style.backgroundImage=`url(${songPlayLink.songCover})`
        lyrics.fetchLyrics(JSON.parse(localStorage.getItem("toBePlayedSongs"))[index].mid)
        
    }
    else 
    {
        
        
       if(songPlayLink.playFlag)
       {
            songPlayLink.audio.pause()   
            songPlayLink.playFlag=false
            
       }
       else if(songPlayLink.playFlag==false)
       {
            
            songPlayLink.audio.play()    
            songPlayLink.playFlag=true
           
       }
       console.log(songPlayLink.playFlag);
        
       
    }
}



</script>

<template>
        <div class="bacimage" ref="bacimage"></div>
        <div class="mask"></div>
        <div class="mod-play">   
                <div class="mod-play-left">
                    <div class="occupation">
                        <div class="head-options">
                            <div class="public" @click="collectSongs"><span class="iconfont icon-aixin" ref="collectionRefs"></span><p>收藏</p></div>
                            <div class="public" @click="addSongs"><span class="iconfont icon-tianjia2"></span><p>添加到</p></div>
                            <div class="public" @click="downloadSongs"><span class="iconfont icon-xiazai"></span><p>下载</p></div>
                            <div class="public" @click="deleteSongs"><span class="iconfont icon-shanchu"></span><p>删除</p></div>
                            <div class="public" @click="toBePlayed.deleteLists()"><span class="iconfont icon-qingkong"></span><p>清除列表</p></div>
                        </div>
                    </div>
                
                    <div class="songlist">
                        <div class="song-bar">
                            <div class="choice">
                                <input type="checkbox" id="select-all" class="offscreen" ref="allCheckedRef">
                                <label for="select-all" class="lable-chosen"  @click="checkedAllSongs"></label>
                            </div>
                            <div class="song-name">&nbsp;&nbsp;&nbsp;&nbsp;歌曲</div>
                            <div class="singer">歌手</div>
                            <div class="time ">&nbsp;&nbsp;时长</div>

                        </div>
                        <div class="song-bar" v-for="(item,index) in toBePlayed.song" :key="index" @mouseover="showa(index)" @mouseleave="hidea(index)">
                            <div class="choice" >
                                <input type="checkbox" :id="`checkbox-${index}`" class="offscreen" ref="checkboxRefs">
                                <label :for="`checkbox-${index}`" class="lable-chosen" @click="checkedSongs(index)"></label>
                            </div>
                            <div class="song-name">
                                <div class="song-occupation">
                                    
                                    <div class="" ref="songNumRefs" :class="songPlayLink.playFlag&&songPlayLink.playIndex==index ?'song-number':''">{{ index+1 }}</div>&nbsp;&nbsp;
                                    <div class="song-title" @click="toSongDetalisPage(item.mid)">{{ item.songname }}</div>
                                    <div class="MV MV-vip-public" v-if="item.mv.id==0?false:true"><router-link to="">MV</router-link></div>
                                    <div class="vip MV-vip-public" v-if="item.pay==0?false:true">VIP</div>
                                    <div class="play-feature" v-if="activeIndex===index">
                                        <div class="play feature-public" @click="playsong(index)">
                                            <span class="iconfont " 
                                            :class="index===songPlayLink.playIndex&&songPlayLink.playFlag? 'icon-ai07':'icon-bofang'"></span>
                                        </div>
                                        <div class="add feature-public">
                                            <span class="iconfont icon-tianjia"></span>
                                        </div>
                                        <div class="download feature-public" v-if="!item.pay">
                                            <span class="iconfont icon-icon-test"></span>
                                        </div>
                                        <div class="share feature-public" v-if="!item.pay">
                                            <span class="iconfont icon-fenxiang"></span>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                            <div class="singer"><span v-for="(i,singeridx) in item.singername" :key="singeridx">{{ i.name }}&nbsp;</span></div>
                            <div class="time ">
                                <div class="feature-public">
                                    <div v-if="!(activeIndex===index)">{{ item.lasttime }}</div>
                                    <span class="del-bucket iconfont icon-shanchu" @click="delBucket(index)" v-if="activeIndex===index"></span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="mod-play-right"><img-lyrics></img-lyrics></div>
        </div>
   <play-controls></play-controls>

</template>

<style scoped>
    .bacimage {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: .8;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: 50%;
        filter: blur(65px);
         background-image: url("");
         transform: translateZ(0);
    }
    .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #000;
        opacity: 0.5;
    }
    .mod-play {
       position: relative;
       top: 10vh;
        display: flex;
        justify-content: space-between;
        /* vh代表视口单位，1vh表示当前视口的1%长度，所谓视口就是浏览器窗口放大放小
        此处为了是实现浏览器缩放也不会出现滚动条，和歌曲列表的滚动条的长度随视口改变，但是
        物理位置（屏幕看见的）不会发生变化。另外注意，使用了vh，那么所有大型外部盒子高度
        都得用vh表示，混用px依然会导致滚动条出现 */
        height: calc(90vh);
       
        margin-left:calc(14vh);
        /* background-color: antiquewhite; */
    }
    .mod-play-left {
       display: flex;
       flex-wrap: wrap;
       align-content: flex-start;
        width: 1000px;
        height: 100%;
        flex-grow: 1;
    }
    .mod-play-right {
        width: 700px;
        
        
        }
    .occupation {
        width: 100%;
        height: 50px;
    }
    .head-options {
        display: flex;
      
        justify-content: space-between;
        width: 620px;
        height: 50px;
        /* background-color: lightblue; */
    }
    .public {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 120px;
        height: 35px;
        color: #e8e7e6;
        /* background-color: aqua; */
        border-radius: 3px;
        border: 1px solid rgba(241, 235, 239, 0.644);
    }
    .public span {
        margin-right: 3px;
        
    }
    
    .public:hover {
        cursor: pointer;
        border-color: #fff;
        color: #fff;
    }
 
    .songlist {
        display: flex;
        overflow:auto;
        flex-wrap: wrap;
        align-content: flex-start;
        width: 100%;
        height: calc(62vh);
        /* background-color: #31c37c; */
    }
    /* 以下是对滚动条的样式美化 */
    .songlist::-webkit-scrollbar {
        width: 10px;
        height: calc(62vh);
        background:transparent;
        border-radius: 5px;
    }
    .songlist::-webkit-scrollbar-thumb {
        width: 10px;
        border-radius: 5px;
        background-color: rgba(159, 156, 156,0.3);
    }
    .songlist::-webkit-scrollbar-track {
        border-radius: 5px;
    }
    .songlist::-webkit-scrollbar-thumb:hover {
        background-color: rgba(159, 156, 156,0.8);
    }
    .song-bar {
      display: flex;
      
    width: 100%;
    height: 50px;
        /* background-color: pink; */
        
    }
    .choice {
        display: flex;
        width: 60px;
        /* background-color: aqua; */
        align-items: center;
    }
    /* 隐藏默认复选框 */
/* 隐藏默认复选框 */
.offscreen {
    display: none;
}
.offscreen:hover {
    border: 1px solid #fff;
}
/* 自定义复选框样式 */
.lable-chosen {
    position: relative;
    
    width: 15px;
    height: 15px;
    background: transparent;
    border: 1px solid rgba(159, 156, 156, 0.3);
    cursor: pointer;
}

/* 复选框选中状态样式 */
.lable-chosen::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    
}
/* 注意伪元素要在伪类选择器之后 */
.lable-chosen:hover::after {
   border-color: #fff;
}

/* 复选框被选中时的样式 */
.offscreen:checked + .lable-chosen::after {
    /* display: block; */
    position: absolute;
    background-image: url('https://y.qq.com/ryqq/static/media/icon_sprite.630b3e60.png?max_age=2592000'); /* 替换成打勾图标的路径 */
    background-position: -60px -80px;  /*这里使用了精灵图 */
    background-repeat: no-repeat;
    border:1px solid #fff;
    /* background-size: contain; */
}

    .song-name {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 450px;
    color: #b8b8b8;
    flex-grow: 0.65;
    /* background-color: antiquewhite; */
}
    .song-occupation {
        
        width: 100%;
        display: flex;
        /* justify-content: space-between; */
        align-items: center;
        /* background-color: lightblue; */
    }
    .song-number {
        width: 10px;
        height: 10px;
        /* 这是gif官网链接：https://y.qq.com/mediastyle/yqq/img/wave.gif?max_age=2592000
        避免以后链接失效，这里保存在assets里 */
        background: url('../../assets/img/wave.gif') 0 0 no-repeat;
    }

.song-title {
    margin-right: 2px;
    height: 50px;
    line-height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #b8b8b8;
}

.song-title:hover {
    cursor: pointer;
    color: #fff;
}

.MV-vip-public {
    margin-left: 10px;
    width: 40px;
    height: 20px;
    color: #31c37c;
    line-height: 20px;
    text-align: center;
    border: 1px solid #2caf6f;
    border-radius: 4px;
}
.MV a {
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
/* feature-public 后面还单独设置了一些样式是因为图标初始尺寸不一致 */
    .feature-public {
        display: flex;
        justify-content: center;
        width: 44px;
        height: 44px;
        line-height: 44px;
        /* background-color: #31c37c; */
        border-radius: 22px;
        
    }
    .feature-public span {
        font-size: 40px;
        
        color: #a2a2a2;
    }
    .feature-public span:hover {
        color: #fff;
        cursor: pointer;
    }
    .singer {
        width: 200px;
        padding-left: 10px;
        line-height: 50px;
        /* background-color: aquamarine;    */
        color: #b8b8b8;
        flex-grow: 0.35;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
       
    }
    .singer span {
        color: #b8b8b8;
    }
    .singer span:hover{
        color: #fff;
    }

    .time {
      
        width: 90px;
        line-height: 50px;
        /* background-color: lightgoldenrodyellow; */
        color: #b8b8b8;
        
    }

    .feature-public .del-bucket {
        font-size: 30px;
    }
    
    
    .download span {
        font-size: 36px;
        
    }
    .share span {
        font-size: 38px;
    }
   
   
</style>
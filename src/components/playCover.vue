<!-- 该组件是一个公共组件，作为歌曲，专辑，MV的播放封面，鼠标经过会有动画效果，分为图片变大和显示播放按钮，没有按钮代表点击后是查看详情。
    使用该组件需要传递图片宽高（不传递默认240x240），图片链接，播放对象的id，是否启用动效(不传布尔值则默认启用) ，是否缩小播放按钮，是否允许查看播放对象详情-->
    <script setup>
    import { onMounted, ref } from "vue";
    import { useRouter } from "vue-router";
    
        const props=defineProps({
            activeWidthAndHeight:{
                type:Object
            },
            cover:{
                type:String
            },
            jumpId:{
                type:String
            },
            cartoonFlag:{
                type:Object
            },
            // 有些图片尺寸过小，需要缩小三角播放按钮
            shringkButtonFlag:{
                type:Boolean
            },
            allowDetail:{
                type:Boolean,
                required:true
            }
    
        })
        const songCoverRef=ref(null)
    
        onMounted(()=>{
            if(props.activeWidthAndHeight)
        {
            // console.log(props.activeWidthAndHeight);
            songCoverRef.value.style.width=`${props.activeWidthAndHeight.width}px`
            songCoverRef.value.style.height=`${props.activeWidthAndHeight.height}px`
        }
        })
        // 动画开启时控制效果的显示消失
        const flag=ref(false)
        // 单独针对某种动画进行控制
        const playCartoon=ref(true)
        const imgCartoon=ref(true)
        if(props.cartoonFlag)
        {
            playCartoon.value=props.cartoonFlag.playCartoon
            imgCartoon.value=props.cartoonFlag.imgCartoon
        }
        // 传递一个信号，表示点击了播放按钮
        const emit=defineEmits(['passPlaySignal'])
    
        const router=useRouter()
        const jumpToDetail=()=>{
            if(props.allowDetail)
            {
                //     let routeData=router.resolve({
                //     name:'songlist-details',
                //     params:{dissid:props.jumpId}
                // })
                //     window.open(routeData.href,'_self')
                    router.push({
                    name:'songlist-details',
                    params:{dissid:props.jumpId}
                })
            }
            
        }
            
    </script>
    
    <template>
        
            <div class="song-cover" ref="songCoverRef" @mouseenter="flag=!flag" @mouseleave="flag=!flag">
             
                 <img :src="`${cover}`" alt="" class="cover-img" :class="{'active-img':flag&&imgCartoon}">  
                 <!-- 遮罩层 -->
                <div class="song-mask" :class="{'active-style':flag}" @click="jumpToDetail">
                    <div class="play-button" :class="{'mask-active':flag,'shringk':shringkButtonFlag}" @click="emit('passPlaySignal',true)" v-if="playCartoon">
                    <span class="iconfont icon-triangle-play"></span>
                    </div>
                </div>  
            </div>
              
            
        
    </template>
    
    <style scoped>
        
       
        
        
        
        .song-cover {
            overflow: hidden;
            position: relative;
            margin-bottom: 15px;
          
            /* background-color: gold; */
        }
        .cover-img {
            width: 100%;
            height: 100%;
            transform: scale(1);
            transition: all 0.4s ease-out;
        }
        .active-img {
            transform: scale(1.1);
        }
        .song-mask {
            display: flex;
            position: absolute;
            top: 0;
            justify-content: center;
            align-items: center;
            margin-bottom: 15px;
            width: 100%;
            height: 100%;
            
            background-color: rgba(0, 0, 0 ,0);   
        }
        .active-style {
            background: rgba(0, 0, 0, 0.2);
            
        }
    
        .play-button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 50px;
            height: 50px;
            
            background-color: #f2f2f2;
            opacity: 0;
            border-radius: 50%;
           
            transition: all 0.4s ease-out;
         }
         .play-button span {
            font-size: 20px;
            color: #545454;
            transform: translateX(3px);
         }
        .mask-active {
            opacity: 1;
            transform: scale(1.5);
         }
       .shringk {
            
            transform: scale(0.7);
       }
    </style>
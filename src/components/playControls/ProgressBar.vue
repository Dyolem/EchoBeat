<script setup>
// 监听currentTime变化改变进度条
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useSongPlayLink } from "@/store/songPlayLink.js"
import { useLyrics } from "@/store/lyrics.js"
const lyrics = useLyrics()
const router = useRouter()
const songPlayLink = useSongPlayLink()

const progressBarMaskRef = ref(null)
const progressBarRef = ref(null)
const progressBarWidth = ref(0)
onMounted(() => {
  progressBarWidth.value = progressBarRef.value.getBoundingClientRect().width
})
// 监听currentTime变化改变进度条
const ratio = ref(0)
watch(
  () => songPlayLink.currentTime,
  (newVal, oldVal) => {
    if (!songPlayLink.audio) {
      ratio.value = 0
      return
    }
    ratio.value = newVal / songPlayLink.audio.duration
  },
)
const progressBarTransform = computed(() => {
  return `translate(${progressBarWidth.value * ratio.value}px,-50%)`
})
const progressBarMaskScale = computed(() => {
  return `scaleX(${ratio.value})`
})

// 点击歌曲后新建一个窗口展示歌曲详情页面
const toSongDetailsPage = (mid) => {
  let routeData = router.resolve({
    // 两种写法都可以
    // path:'/song-details/'+lyrics.mid,
    name: "song-details",
    params: { mid: lyrics.mid },
  })
  window.open(routeData.href, "_blank")
}

const dragAnimationCallback = (e) => {
  requestAnimationFrame(() => {
    const progressBarWidth = progressBarRef.value.getBoundingClientRect().width
    const offsetX =
      (e.clientX - progressBarMaskRef.value.getBoundingClientRect().left) /
      progressBarWidth
    if (offsetX <= 1) {
      ratio.value = Number(offsetX.toFixed(2))
      songPlayLink.audio.currentTime = offsetX * songPlayLink.audio.duration
    } else {
      ratio.value = 1
    }
  })
}
const startDragging = (e) => {
  document.addEventListener("mousemove", dragging)
}
const endDragging = (e) => {
  document.removeEventListener("mousemove", dragging)
  dragAnimationCallback(e)
  document.removeEventListener("mouseup", endDragging)
}
const dragging = (e) => {
  // 这里加上弹起事件的原因是，如果鼠标一直不弹起，并且已经滑出了进度条盒子的范围，此时若弹起，
  //会导致浏览器认为鼠标依然没有弹起，仍然保持在按下状态，并且此时也控制不了进度条移动了，而当下次光标经过进度条时，不用点击，
  // 只要移动就会移动进度条，因为浏览器认为你还是按压状态，所以可以拖动。解决办法就是在整个页面也监听弹起事件，
  // 另外这个全局监听要放dragging里，不然会影响页面中其他元素的弹起事件
  // 触发这个bug的方式有两种，第一种是，物理bug，鼠标按下给浏览器按下事件，但是不知道怎么回事，物理硬件上鼠标弹起来了，但是不会触发弹起事件
  // 第二种是页面中有些元素不可选中挪动，由于是按压状态，和复制选中操作一样，因为复制选中就是先按压再弹起，此时浏览器会自动结束，
  // 光标会成为一个禁止标志，而一旦成为这个标志，鼠标如果不弹起，它不会消失，一弹起，浏览器判定鼠标还是按下状态，就触发bug了
  // 第二种还没解决
  document.addEventListener("mouseup", endDragging)
  dragAnimationCallback(e)
}
</script>

<template>
  <div class="progress-bar-container">
    <div class="song-info">
      <div class="song-title">
        <div class="songname" @click="toSongDetailsPage(songPlayLink.mid)">
          {{ songPlayLink.songName }}
        </div>
        <span>-</span>
        <div class="singer">
          <span v-for="(item, index) in songPlayLink.singerName">{{
            item.name
          }}</span>
        </div>
      </div>
      <div class="time">
        {{
          `${songPlayLink.formattedCurrentTime}/${songPlayLink.formattedDuration}`
        }}
      </div>
    </div>
    <div
      class="enlarge-click"
      @mousedown="startDragging"
      @mouseup="endDragging"
    >
      <div class="progress-bar" ref="progressBarRef">
        <div class="progress-bar-mask" ref="progressBarMaskRef"></div>
        <div class="mark"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-bar-container {
  flex-grow: 1;
  margin: 0 20px;
  height: 50px;
  /* background-color: aquamarine; */
}
.song-info {
  --song-time-width: 110px;
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
.songname {
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
  text-align: right;
  width: var(--song-time-width);
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
  position: relative;
  background-color: rgb(128, 128, 128);
}
.progress-bar-mask {
  position: relative;
  /* 由于设置了盒子宽度随视窗放大缩小变化，所以这里不能用px */
  width: 100%;
  height: 3px;
  transform: v-bind(progressBarMaskScale);
  transform-origin: left;
  background-color: #fff;
}

.mark {
  position: absolute;
  top: 100%;
  --progress-point: 10px;
  width: var(--progress-point);
  height: var(--progress-point);
  background-color: #fff;
  border-radius: 50%;
  transform: v-bind(progressBarTransform);
}
.mark:hover {
  cursor: pointer;
}

@media screen and (max-width: 450px) {
  .progress-bar-container {
    width: calc(100vw - var(--padding-x) * 2);
    margin: 0;
    /* background-color: aquamarine; */
  }
  .songname {
  }
  .singer {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #e8e7e6;
  }
  .song-info {
    width: 100%;
  }
  .song-title {
    width: calc(100% - var(--song-time-width));
  }
}
</style>

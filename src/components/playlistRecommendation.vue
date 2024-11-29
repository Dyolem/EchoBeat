<!-- 这是一个封装好的轮播图组件，使用了插槽，一共三个，分别是标题，分类名，轮播图主体，
    可选择插入内容或不插入。其次需要给组件传入一个参数，控制轮播图页数有多少个，具体使用见homePage组件 -->
<!-- wheelButton组件其实该写在这个组件的，因为index需要进行双向通信保持同步很麻烦。不该拆开，后面再来改动吧 后续：已改-->
<script setup>
import { ref, watch } from "vue"

// 接收轮播个数
const props = defineProps({
  renderCount: {
    // required:true,
    // 这个本来是要写的，但是由于数据请求需要时间，会报出警告未传递值，实际不影响程序，但是了好看还是选择不写
    type: Number,
  },
  resetIndex: {
    type: Number,
  },
})

//控制图片轮播
//当前页面索引，轮播左右按钮的控制，底部按钮的渲染移动都依靠index的变化而控制
const index = ref(0)
// 当切换分类时，重置轮播索引为0
watch(
  () => props.resetIndex,
  () => {
    console.log(props.resetIndex)
    index.value = 0
  },
)
//底部当前页按钮显示
const wheelButtonRefs = ref([])

//页面所在页的圆点颜色渲染函数

function render() {
  console.log(props.renderCount)
  for (let i = 0; i < props.renderCount; i++) {
    wheelButtonRefs.value[i].style.background = "#e1e1e1"
  }
  wheelButtonRefs.value[index.value].style.background = "#afafaf"
}
watch(index, () => {
  render()
})

function current(indexs) {
  index.value = indexs
}

function tempover(indexs) {
  wheelButtonRefs.value[indexs].style.background = "#afafaf"
}

function templeave(indexs) {
  wheelButtonRefs.value[indexs].style.background = "#e1e1e1"
  //花了我两小时想出的一行代码，得好好解释：不加这句代码的后果是，点击某个小圆点后，鼠标再经过其他小圆点时，会
  //去除上一个小圆点的样式，因为离开事件必定在点击事件之后，相当于白给上一个小圆点添加样式了。由于index是当前渲染小圆点的真正序号，
  //因此可以触发离开事件后再渲染回来上一个的样式。刚才两个小时都花在了如何避免触发离开事件后会改动上一个圆点的样式，这是正面路径
  //正面路径不行就反着来，被删掉了我再加回来，完美解决！
  render()
}

//控制轮播按钮的渐入渐出
const rightButton = ref(null)
const leftButton = ref(null)

//右按钮
function leftSilde() {
  index.value++
  //index的最大值要根据数据源动态判断
  if (index.value === props.renderCount) index.value = 0
}
//左按钮
function rightSilde() {
  index.value--
  if (index.value == -1) index.value = props.renderCount - 1
}

const isShowSlideButton = ref(false)
function toggleSlideButton() {
  // 创建媒体查询
  const mediaQuery = window.matchMedia("(max-width: 450px)")

  // 检查当前是否匹配媒体查询
  if (mediaQuery.matches) {
    // 如果视口宽度小于等于 600px，执行相应逻辑
    isShowSlideButton.value = false
    console.log("视口小于或等于 600px")
    return
  } else {
    // 否则执行其他逻辑
    console.log("视口大于 600px")
  }
  isShowSlideButton.value = !isShowSlideButton.value
}
</script>

<template>
  <div
    class="container"
    @mouseenter="toggleSlideButton"
    @mouseleave="toggleSlideButton"
  >
    <div class="section-inner">
      <div class="reccomend-head">
        <slot name="reccomend-head"></slot>
      </div>

      <div class="song-classification">
        <slot name="song-classification"></slot>
      </div>
      <!-- 播放列表 -->
      <div class="playlist">
        <slot name="wheel-container" :passTravelDistance="index"></slot>
        <!-- travelDistance是当前轮播圆点索引，需要传给wheelContainer组件，由于使用了插槽，
                需要通过作用域插槽将数据传递，然后 wheelContainer组件再获取作用域插槽传递的值-->
      </div>
      <div class="wheel-casting-items">
        <!-- 扩大底部小按钮点击范围 -->
        <div
          class="enlarge"
          v-for="(items, indexs) in renderCount"
          @click="current(indexs)"
          @mouseover="tempover(indexs)"
          @mouseleave="templeave(indexs)"
          :key="indexs"
        >
          <div class="wheel-button" ref="wheelButtonRefs"></div>
        </div>
      </div>
    </div>

    <!-- 左右轮播按钮 -->
    <Transition name="left-fade">
      <div
        class="right-slide-button public-size"
        ref="rightButton"
        @click="leftSilde()"
        v-if="isShowSlideButton"
      >
        <span class="iconfont icon-xiangyoujiantou"></span>
      </div>
    </Transition>
    <Transition name="right-fade">
      <div
        class="left-slide-button public-size"
        ref="leftButton"
        @click="rightSilde()"
        v-if="isShowSlideButton"
      >
        <span class="iconfont icon-xiangzuojiantou"></span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.left-fade-enter-active,
.right-fade-leave-active {
  transition: all 0.5s ease;
}

.left-fade-enter-from,
.left-fade-leave-to {
  opacity: 0;
  translate: 100%;
}

.right-fade-enter-from,
.right-fade-leave-to {
  opacity: 0;
  translate: -100%;
}

.container {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  background: linear-gradient(180deg, #f2f2f2, #fafafa);
}

.section-inner {
  width: 1300px;
  /* height: 600px; */
  /* background-color: lightblue; */
}

@media screen and (max-width: 450px) {
  .section-inner {
    width: 100vw;
  }
}

.reccomend-head {
  margin-top: 45px;
  text-align: center;
  letter-spacing: 10px;
  font-size: 20px;

  color: #333333;
  /* background-color: aqua; */
}

.song-classification {
  display: flex;
  justify-content: center;
}

.playlist {
  width: 100%;
  /* height: 350px; */
  /* background-color: antiquewhite; */
}

/* @media screen and (max-width:450px) {
  .playlist {
    width: 100vw;
  }
} */

.wheel-casting-items {
  display: flex;
  justify-content: center;
  height: 50px;
  /* background-color: aquamarine; */
  /* cursor: pointer; */
}

@media screen and (max-width: 450px) {
  .wheel-casting-items {
    display: none;
  }
}

.wheel-button {
  margin: 20px 12px;
  width: 9px;
  height: 9px;
  background-color: #e1e1e1;
  border-radius: 4.5px;
}

/* 使页面第一次加载时渲染第一个小圆点 */
.enlarge:first-of-type .wheel-button {
  background-color: #afafaf;
}

.right-slide-button {
  position: absolute;
  top: 50%;
  right: 0px;
  font-family: icomoon;
  transform: translateY(-50%);
}

.left-slide-button {
  position: absolute;
  top: 50%;
  left: 0px;
  transform: translateY(-50%);
}

.public-size {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 134px;
  background: rgba(0, 0, 0, 0.05);

  transition: all 0.4s linear;
}

.left-slide-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.right-slide-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.public-size span {
  font-size: 50px;
  color: #333333;
}
</style>

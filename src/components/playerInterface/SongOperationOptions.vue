<script setup>
import { ref } from "vue"

import { userToBePlayedStore } from "@/store/toBePlayed.js"
const toBePlayed = userToBePlayedStore()

const { checkboxRefs, checkedSongArray } = defineProps({
  checkedSongArray: {
    default: [],
  },
  checkboxRefs: {
    default: [],
  },
})
const emit = defineEmits(["resetCheckedSongArray"])
// 收藏歌曲爱心颜色控制
const collectionRefs = ref(null)

function collectSongs(params) {
  // 用if判断颜色
  if (collectionRefs.value.style.color === "rgb(240, 104, 104)") {
    collectionRefs.value.style.color = "#fff"
    return
  }
  // console.log(collectionRefs.style.color)
  collectionRefs.value.style.color = "rgb(240, 104, 104)"
  // console.log(collectionRefs.style.color)
}

// 顶部删除按钮的逻辑
function deleteSongs() {
  checkedSongArray.forEach((index) => {
    checkboxRefs[index].checked = false
    toBePlayed.deleteCurrentSong(index) //删除歌曲是调用的toBePlayed里的方法。思考一个问题，如果checkedSongArray数组里的元素不是降序的
    // 那么正常的从0开始删会导致一个问题，比如删除第2首歌，索引为1，接着我们打算删第3首歌，索引应该为2，此时由于第2首歌没有了，第3首歌到了第2首歌的位置，
    // 第4首歌占了第3首歌的位置，由于给的删除索引就是2，所以实际是删除第4首歌去了。总结以上就是：前一个元素消除后，导致后面所有元素索引值都要变化，
    // 因此我们直接从后往前删，就避免了这个问题，保持checkedSongArray降序排列就是这个原因
  })
  emit("resetCheckedSongArray", [])
}
</script>

<template>
  <div class="options-container">
    <div class="head-options">
      <div class="public" @click="collectSongs">
        <span class="iconfont icon-aixin" ref="collectionRefs"></span>
        <p>收藏</p>
      </div>
      <div class="public" @click="addSongs">
        <span class="iconfont icon-tianjia2"></span>
        <p>添加到</p>
      </div>
      <div class="public" @click="downloadSongs">
        <span class="iconfont icon-xiazai"></span>
        <p>下载</p>
      </div>
      <div class="public" @click="deleteSongs">
        <span class="iconfont icon-shanchu"></span>
        <p>删除</p>
      </div>
      <div class="public" @click="toBePlayed.deleteLists()">
        <span class="iconfont icon-qingkong"></span>
        <p>清除列表</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.options-container {
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
</style>

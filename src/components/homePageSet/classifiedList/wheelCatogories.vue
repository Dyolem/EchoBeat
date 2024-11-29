<script setup>

import { ref, watch, toRefs } from 'vue';

import { useSonglistCategoryStore } from '../../../store/songlistCategory';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const songlistCategoryStore = useSonglistCategoryStore()

const moreRef = ref([])
const categoryIndex = ref(-1)  //存储含有’更多‘按钮的元素的索引
const lastIndex = ref(null)

document.addEventListener('click', function () {
  if (categoryIndex.value != -1) {
    moreRef.value[categoryIndex.value].style.backgroundColor = ''
    moreRef.value[categoryIndex.value].style.color = ''
    categoryIndex.value = -1
  }
  // console.log(categoryIndex.value);

})



const wheelplayContainerRef = ref(null)
const props = defineProps({
  travelDistance: {
    type: Number,
    required: true,
  }
})

const { travelDistance } = toRefs(props)
watch([travelDistance], ([newValue, oldValue]) => {
  wheelplayContainerRef.value.style.transform = `translateX(-${newValue * 1300}px)`
  console.log(newValue);
})



// 虽然确实不提倡过多操纵dom，但是用：class方式试过一遍后，很麻烦，，因为模板中v-for里还套了一个v-for，而且也不好注释，所以还是用dom方式
function moreIndex(idx, event) {
  // console.log(moreRef.value);
  if (lastIndex.value != null) {
    moreRef.value[lastIndex.value].style.backgroundColor = ''
    moreRef.value[lastIndex.value].style.color = ''
  }
  lastIndex.value = idx
  if (categoryIndex.value == -1) {
    event.stopPropagation()
  }

  categoryIndex.value = idx
  moreRef.value[categoryIndex.value].style.backgroundColor = '#31c27c'
  moreRef.value[categoryIndex.value].style.color = '#fff'
}
function prohibitPopover(event) {
  event.stopPropagation()
}


const recentClickCategory = ref([])

onMounted(async () => {
  await songlistCategoryStore.fetchSongListCategoriesData()
  recentClickCategory.value = JSON.parse(localStorage.getItem('recentClickSonglistCategoy')) //获取最近常用数据
  if (recentClickCategory.value) {

    recentClickCategory.value.reverse()
  }

})



// 路由跳转，触发watch监听

const router = useRouter()

function fetchKindSonglist(kinds) {

  router.push({
    path: '/classified-playlist',
    query: { t1: kinds.id }
  })


}





</script>

<template>
  <div class="more-kinds" v-if="categoryIndex !== -1 ? true : false" @click="prohibitPopover($event)">
    <div class="additional-kinds"
      v-for="(moreitems, idx) in songlistCategoryStore.categories[categoryIndex].list.slice(8, songlistCategoryStore.categories[categoryIndex].list.length)"
      :key="idx" @click="fetchKindSonglist(moreitems)">{{ moreitems.name }}
    </div>
  </div>
  <div class="classified-title-box">
    <div class="wheelplay-container" ref="wheelplayContainerRef">
      <div class="broad-category">
        <h4 class="category-title">{{ '最近常用' }}</h4>
        <div class="kind-container">
          <div class="kind" v-for="item in recentClickCategory" :key="item.id" @click="fetchKindSonglist(item)">{{
            item.name }}</div>
        </div>
      </div>
      <div class="broad-category" v-for="(item, index) in songlistCategoryStore.categories" :key="index">
        <h4 class="category-title">{{ item.type }}</h4>
        <div class="kind-container">
          <div class="kind" v-for="(kinds, kindex) in (item.list).slice(0, 8)" :key="kindex"
            @click="fetchKindSonglist(kinds)">{{ kinds.name }}
          </div>
          <!-- 这里使用v-show的原因是，由于div.kind动态渲染，所以moreRef最终获取的dom个数不一定等于categoryName个数
                            因为只有种类大于了8个以上的才显示更多按钮，就会导致修改更多的背景颜色时，索引混乱。
                        举个例子：1，2，3号盒子，其中2，3含有更多按钮，此时点击2号盒子，传递参数为1，如果使用v-if，实际获取的dom只有2，3，此时传递的参数1
                    就对应到了3号盒子，最终修改颜色是3号，因此需要保持索引不变，使用v-show -->
          <div class="kind" v-show="item.list.length > 8 ? true : false" @click="moreIndex(index, $event)"
            ref="moreRef">更多
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.selected {
  background-color: #31c27c;
  color: #fff;
}

.more-kinds {
  position: absolute;
  top: 200px;
  display: flex;
  align-items: center;
  width: 1300px;
  height: 60px;
  background-color: #fff;
  box-shadow: rgba(183, 183, 183, 0.65) 0px 0px 10px 0px;
  ;
  z-index: 999;
}

.additional-kinds {
  padding: 0 30px;
  height: 20px;
  text-align: center;
  /* background-color: green; */
}

.additional-kinds:hover {
  cursor: pointer;
  color: #31c27c;
}

.classified-title-box {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 170px;
  /* background-color: plum; */
}

.wheelplay-container {
  position: absolute;
  display: flex;
  height: 170px;
  /* background-color: gold; */
  transform: translateX(0px);
  transition: all 0.5s linear;
}

.broad-category {
  margin-right: 25px;
  width: 300px;
  height: 100%;
  border-right: 1px solid #eeeef0;
  /* background-color: aqua; */
}

.category-title {
  margin: 30px 0 10px 0;
  width: 80px;
  color: #999999;
  /* background-color: antiquewhite; */
}

.kind-container {
  display: flex;
  justify-content: flex-start;
  align-content: space-between;
  flex-wrap: wrap;

  width: 100%;
  height: 90px;
  /* background-color: pink; */
}

.kind {
  margin-left: 10px;
  width: calc(30%);
  height: 20px;
  text-align: center;
  /* background-color: green; */
}

.kind:hover {
  cursor: pointer;
  color: #31c27c;
}
</style>

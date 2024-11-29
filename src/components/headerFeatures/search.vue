<template>
  <div class="search-occupation" ref="searchOccupation" @click="search">

    <input type="text" placeholder="搜索音乐、MV、歌单、用户" @blur="closeSearch" ref="inputRef">
    <i @click="getSearchedResult">
      <echo-lets-icons:search-alt-light
        style="font-size: 2rem;color: #a5a8ad;vertical-align: bottom;"></echo-lets-icons:search-alt-light>
    </i>


    <!-- 搜索栏动画还未完成，记得回来改 -->
    <div class="history-search" ref="heddcre">

    </div>
    <span></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const searchOccupation = ref(null)
const heddcre = ref(null)
const inputRef = ref(null)
const searchKeyWords = ref('')

function search() {
  inputRef.value.focus()
  console.log('success');
  heddcre.value.style.height = '80px'

}
function closeSearch() {
  console.log('leave success');
  heddcre.value.style.height = '0px'

}
function getSearchedResult() {
  if (searchKeyWords.value !== '') {

  }
  else {

  }
}
</script>

<style scoped>
.search-occupation {
  --search-input-height: 40px;
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 1;
  z-index: 100;
  width: 225px;
  height: var(--search-input-height);
  margin: 0 15px;
  padding-left: 10px;
  line-height: 40px;
  border: 1px solid #c9c9c9;
  border-radius: 4px;

}


.search-occupation input {
  width: 100%;
  line-height: 2.5;
  font-size: 1rem;
  color: #999999;
  outline: none;
  border: none;
  text-overflow: ellipsis;
}

.search-occupation input:focus {
  outline: none;

}



.history-search {
  position: absolute;
  top: calc(var(--search-input-height) + 1px);
  left: -1px;
  width: 100%;
  height: 0px;
  border: 1px solid #c9c9c9;
  border-top: 0px;
  background-color: #fff;
  transition: all 0.3s linear;

}
</style>

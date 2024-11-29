<script setup>
import rankingItem from "./rankingItem.vue";
import { useTopRankingStore } from "../../../../store/topRanking"

const topRanking = useTopRankingStore()
topRanking.fetchTopRanking()
</script>

<template>
  <div class="ranking-list-container">

    <div class="ranking-mid">
      <ranking-item v-for="(item, index) in topRanking.peakRanking" :key="index" :songlistInfo="item"
        :order="index"></ranking-item>
      <ranking-item v-for="(item, index) in topRanking.zoneRanking" :key="index" :songlistInfo="item"
        :order="index"></ranking-item>
    </div>
  </div>
</template>

<style scoped>
.ranking-list-container {
  position: relative;
  width: 100%;
  height: 660px;
  margin-top: 50px;
  /* background-color: aquamarine; */
}

.ranking-mid {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  position: absolute;
  left: 50%;
  width: 1300px;
  height: 600px;
  /* background-color: antiquewhite; */
  transform: translateX(-50%);
}

@media screen and (max-width:450px) {
  .ranking-mid {
    width: 100vw;
    justify-content: center
  }
}
</style>

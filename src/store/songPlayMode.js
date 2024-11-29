import { defineStore } from "pinia"
import { ref } from "vue"

export const useSongPlayModeStore = defineStore("songPlayMode", () => {
  const modeStyle = ref([
    {
      fontClass: "icon-24gl-repeat2",
      title: "列表循环",
    },
    {
      fontClass: "icon-24gl-repeatOnce2",
      title: "单曲循环",
    },
    {
      fontClass: "icon-xunhuan",
      title: "随机播放",
    },
    {
      fontClass: "icon-tubiaozhizuomoban-17",
      title: "顺序循环",
    },
  ])
  const count = ref(0)

  return { count, modeStyle }
})

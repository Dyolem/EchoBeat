import { defineStore } from "pinia"
import { getLyricsApi } from "../apis/lyricsApi"
import { convertLyrics } from "../utils/lyricsFormatted.js"

export const useLyrics = defineStore("lyrics", {
  state: () => ({
    mid: "",
    songLyrics: [],
    currentLyrics: 0,
    scrollTop: 0,
  }),
  actions: {
    async fetchLyrics(songmid) {
      this.mid = songmid
      // 为了其他组件也能使用这个接口，这里改为只接收歌曲专辑的mid
      // const storedata=JSON.parse(localStorage.getItem("toBePlayedSongs"))
      // const songmid=storedata[idx].mid
      // console.log(songmid);
      try {
        // const responses = await axios.get(`/api/getLyric?songmid=${mid}&isFormat=true`)
        const responses = await getLyricsApi(songmid)
        console.log(responses)
        this.songLyrics = convertLyrics(responses.data.data.lyric)
        console.log(this.songLyrics)
      } catch (error) {
        console.log(error)
      }
    },
  },
})

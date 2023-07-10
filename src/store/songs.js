import { defineStore } from "pinia";
import axios from 'axios'
import { userSonglistStore } from "./songlist";
export const userSongsStore=defineStore('songs',{
    state: () => ({
       // 确保页面刷新后，localstorage里的数据不会消失。使用localstorage是因为窗口不共享状态
      song: JSON.parse(localStorage.getItem("toBePlayedSongs")) || [],
      loading: false,
      error: null,
      songlistParams:null,
      songRender:null,
      songlistLength:0
    }),
      actions: {
        async fetchSongData(dissid) {
          //保存当前歌单的index，因为页面一刷新所有数据都会消失
        // localStorage.setItem('playItemIndex',idx)
            // const songlistStore=userSonglistStore()
            // this.songlistParams=songlistStore.passData
                                                                                                   
            console.log(dissid);
            
          this.loading = true
         
              try {
                const response = await axios.get(`/api/getSongListDetail?disstid=${dissid}`);
                console.log(response);
                
          this.songRender=response.data.response.cdlist
          this.songlistLength=this.songRender[0].songlist.length
          console.log(this.songRender);

              } catch (error) {
                console.error(error);
              }
              // console.log(this.songRender.songlist.length);
          console.log('success');
        },
        
    },
})
import { defineStore } from "pinia";

import { useSongPlayLink } from "./songPlayLink";
import { useSongListDetailStore } from "./songlistDetail";

export const userToBePlayedStore = defineStore("toBePlayedStore", {
  state: () => ({
    time:0,
    // 确保页面刷新后，localstorage里的数据不会消失。使用localstorage是因为窗口不共享状态
    song: JSON.parse(localStorage.getItem("toBePlayedSongs")) || [],
    checked:false
  }),

  actions: {
    tobeplay(idx) {
      // 以下是单首歌曲加入待播放歌曲，putAllSong是一个歌单全部加入
      

      const songlistDetail=useSongListDetailStore()

      const newSong = {
        src: "",
        mid: songlistDetail.songlist[idx].songmid,
        songname: songlistDetail.songlist[idx].songname,
        lasttime: songlistDetail.songlist[idx].interval,
        songcover:songlistDetail.songlist[idx].albummid,
        albumname:songlistDetail.songlist[idx].albumname,
      
        // 可能有多个歌手
        singername: songlistDetail.songlist[idx].singer,
        mv:songlistDetail.songlist[idx].vid,
        pay:songlistDetail.songlist[idx].pay.payplay
      };

    const pos=this.song.findIndex((song)=>song.mid===newSong.mid)
     
      
      console.log(pos);
      // 如果存在，则删除原歌曲
      if (pos!==-1) {

        console.log("The song is already in the to-be-played list.");
        this.song.splice(pos,1)
      } 
      // 将歌曲添加到列表里，如果是新歌曲，会跳过if，旧歌曲则删了再插入头部
        this.song.unshift(newSong);
        
      // 将待播放列表信息存储在本地存储中
      localStorage.setItem("toBePlayedSongs", JSON.stringify(this.song));
     
    
    },
    putAllSongs (){

      const songlistDetail=useSongListDetailStore()
      // 整个歌单所有歌曲全部加入待播放列表
         // 检查歌曲是否已经存在于待播放列表中
         
       for(let i=0;i<songlistDetail.songlistLength;i++){
        const newSong = {
          src: "",
          mid: songlistDetail.songlist[i].songmid,
          songname: songlistDetail.songlist[i].songname,
          lasttime: songlistDetail.songlist[i].interval,
          songcover:songlistDetail.songlist[i].albummid,
          albumname:songlistDetail.songlist[i].albumname,
        
          // 可能有多个歌手
          singername: songlistDetail.songlist[i].singer,
          mv:songlistDetail.songlist[i].vid,
          pay:songlistDetail.songlist[i].pay.payplay
        };
       this.storageTempSong(newSong)
        
        
      }
      // this.bestored=true
    },
    storageTempSong(songObj){
      const pos=this.song.findIndex((song)=>song.mid===songObj.mid)

        console.log(pos);
        // 如果存在，则删除原歌曲
        if (pos!==-1) {
  
          console.log("The song is already in the to-be-played list.");
          this.song.splice(pos,1)
        } 
        // 将歌曲添加到列表里，如果是新歌曲，会跳过if，旧歌曲则删了再插入头部
          this.song.unshift(songObj);
        // 将待播放列表信息存储在本地存储中
        localStorage.setItem("toBePlayedSongs", JSON.stringify(this.song));
    },
    deleteLists (){
      this.song=[]
      localStorage.setItem("toBePlayedSongs", JSON.stringify(this.song));
    },
    deleteCurrentSong (idx){
      const songPlayLink=useSongPlayLink()
      this.song.splice(idx,1)
      // console.log(this.song);
      // console.log('suc');
      if(songPlayLink.playIndex>idx)
      songPlayLink.playIndex--
     
      else if(songPlayLink.playIndex==idx)
      {
        // 如果删除的是当前播放歌曲。调用下一首歌曲即可，这里通过改变ended值来触发playControl里的监听
        songPlayLink.audio.pause()
        //因为自身被删除了，又因为删除了默认播放下一首，playIndex会加一，所以需要提前减一来抵消
       
        songPlayLink.playIndex--
         
        songPlayLink.ended=true
        
        
      }
      
      
      // console.log(this.song);
      localStorage.setItem("toBePlayedSongs", JSON.stringify(this.song));
      
      // console.log(localStorage.getItem('toBePlayedSongs'));
      
    }
  }
});


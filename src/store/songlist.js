
import { defineStore } from "pinia";
import { getSonglistApi} from "../apis/songlistApi"


export const useSonglistStore=defineStore('songlist',{
    state:()=>({
        data: null,
        loading: false,
        error: null,
        songlist:[],
        listlength:null
    }),
    actions: {
        async fetchSongListData(songlistId) {
            // console.log(songlistId);
            if(!songlistId)
            songlistId=10000000
            this.loading = true
                try {
                  const response = await getSonglistApi(songlistId)
                  console.log(response);
                  this.songlist=response.data.data.list
                  this.listlength=this.songlist.length
                  console.log(this.listlength);
                } catch (error) {
                  console.error(error);
                }
             
          console.log('success');
        },
      
      },
      
})
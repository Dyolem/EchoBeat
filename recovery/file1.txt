import { defineStore } from "pinia";
import { getNewSongPublishApi } from "../apis/newSongPublishApi";
export const useNewSongStore=defineStore('newSong',{
    state:()=>({
        loaded: true,
        error: null,
        songlist:[],
        listLength:null
        
    }),
    actions: {
        async fetchNewSong(typeId) {
          this.loaded = true
              try {
                // const response = await axios.get('/api/getRecommend');
                const response = await getNewSongPublishApi(typeId)
                console.log(response);
              
                this.songlist=response.data.data.list
                this.listLength=this.songlist.length
                this.loaded=false
                
              } catch (error) {
                console.error(error);
              }
              
        },

      },
})
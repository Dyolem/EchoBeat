import { defineStore } from "pinia";
import { getNewAlbumPublishApi } from "../apis/newAlbumPublishApi";
export const useNewAlbumStore=defineStore('newAlbum',{
    state:()=>({
        loaded: true,
        error: null,
        list:[],
        listLength:null
        
    }),
    actions: {
        async fetchNewAlbum(typeId) {
          this.loaded = true
              try {
                const response = await getNewAlbumPublishApi(typeId)
                console.log(response);
              
                this.list=response.data.data.list
                this.listLength=this.list.length
                console.log(this.listLength);
                this.loaded=false
                
              } catch (error) {
                console.error(error);
              }
              
        },

      },
})
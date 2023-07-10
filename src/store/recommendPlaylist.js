import { defineStore } from "pinia";
import { getRecommendPlaylist } from "../apis/recommendPlaylist";
import { getRecommendForYou } from "../apis/recommendForYouApi";
export const useRecommendPlaylistStore=defineStore('recommendPlaylist',{
    state:()=>({
        loaded:true,
        titleAndTid:[],
        cover:[],
        creator:[],
        listLength:null
    }),
    actions:{
        async fetchRecommendForYou(){
            this.titleAndTid=[]
            this.cover=[]
            this.creator=[]
            try{
                this.loaded=true
                const response= await getRecommendForYou()
                
                this.listLength=response.data.data.list.length
                response.data.data.list.forEach(item => {
                    this.titleAndTid.push({
                        title: item.title,
                        tid:item.content_id.toString(),
                        playNum:item.listen_num
                    }) 
                    this.cover.push(item.cover)
                    
                    
                });


                this.titleAndTid=this.increaseArr(this.titleAndTid)
                this.cover=this.increaseArr(this.cover)
                this.creator=this.increaseArr(this.creator)
                this.loaded=false
            }catch(error){
                console.error();
            }
        },
        
        async fetchRecommendPlaylist(id){
            this.titleAndTid=[]
            this.cover=[]
            this.creator=[]
            try{
                this.loaded=true
                const response= await getRecommendPlaylist(id)
               
                this.listLength=response.data.data.list.length
                response.data.data.list.forEach(item => {
                    this.titleAndTid.push({
                        title: item.title,
                        tid:item.tid.toString(),
                        playNum:item.access_num
                    }) 
                    this.cover.push(item.cover_url_medium)
                    this.creator.push(item.creator_info)

                });
                    
                    this.loaded=false
                
            }catch(error){
                console.error(error);
            }
            
        },
        increaseArr(arr){
            if(this.listLength%5!==0){
                return arr=[...arr,...(arr.slice(0,5-this.listLength%5))]
            }
            
            // console.log(arr);
        }
    }
})
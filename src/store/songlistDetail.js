import { defineStore } from "pinia";
import { getSonglistDetail } from "../apis/songlistDetailApi";


export const useSongListDetailStore=defineStore('songListDetail',{
    state:()=>({
        loading:false,
        logo:'',
        dissname:'',
        desc:'',
        nickname:'',
        tag:[],
        visitNum:'',
        songlist:[],
        songlistLength:null
    }),
    actions:{
        async fetchSongDetail(id){
            
            try{
                const response= await getSonglistDetail(id)
                this.loading=true
                this.logo=response.data.data.logo
                this.dissname=response.data.data.dissname
                this.desc=response.data.data.desc
                this.nickname=response.data.data.nickname
                this.tag=response.data.data.tags
                this.visitNum=response.data.data.visitnum
                this.songlist=response.data.data.songlist
                this.songlistLength=this.songlist.length
                console.log(this.dissname,this.visitNum);
            }catch(error){
                console.error(error);
            }
            
        }
    }
})
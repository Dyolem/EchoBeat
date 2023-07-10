
import { defineStore } from "pinia";
import { getRecommendBannerApi } from "../apis/recommendBannerApi"

export const useExcellentRecommendation= defineStore('excellentRecommendation',{
    state:()=>({
        loaded:false,
        albumInfo:[],
        listLength:null
    }),
    actions:{
        async fetchExcellentRecommendation(){
            this.loaded=true

            try{
                const responses = await getRecommendBannerApi()
                this.albumInfo=responses.data.data
                this.listLength=this.albumInfo.length
                this.increaseArr()
                this.loaded=false
            }catch(error){
                console.log(error);
            }
        },
        increaseArr(){
            if(this.listLength%2!==0){
                this.albumInfo=[...this.albumInfo,this.albumInfo[0]]
            }
        }
    }
})
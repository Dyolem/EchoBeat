
import { defineStore } from "pinia";
import { getTopCategoryApi } from "../apis/topCategoryApi";



export const useTopRankingStore= defineStore('topRanking',{
    state:()=>({
        data:[],
        peakRanking:[],
        zoneRanking:[]
    }),
    actions:{
        async fetchTopRanking(){
            
            try{
                const response=await getTopCategoryApi()
                this.data=response.data.data
                // console.log(this.data);
                this.peakRanking=this.data[0].list.slice(1,4)
                this.zoneRanking=this.data[1].list.slice(3,5)
                // console.log(this.peakRanking);
                // console.log(this.zoneRanking);
            }catch(error){
              console.log(error);
            }
          }
    }
})
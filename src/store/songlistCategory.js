import { defineStore } from "pinia";
import {getSonglistCategoryApi} from "../apis/songlistCategoryApi"

export const useSonglistCategoryStore=defineStore('songlistCategory',{
    state:()=>({
        data: null,
        loading: false,
        error: null,
        categories:null,
        categoriesLength:0,
        newListArr:[],
        currentCategoryAndId:{}
    }),
    actions: {
        async fetchSongListCategoriesData() {
          this.loading = true
              try {
                const response=await getSonglistCategoryApi()
                // console.log(response);
                this.categories=response.data.data
                this.categoriesLength=this.categories.length
                this.categories.forEach(element => this.newListArr.push(...element.list));
              } catch (error) {
                console.error(error);
              }
              
              
          console.log('success');
        },
        CheckCurrentCategory(query){
          if(!query)
          {
            this.currentCategoryAndId={id:10000000,name:'推荐歌单'}
            return
          }
          let index=this.newListArr.findIndex(item=>item.id==query)
          if(index!==-1)
          this.currentCategoryAndId=this.newListArr[index]
        }
      },
})
import { defineStore } from "pinia";
import {getSonglistCategoryApi} from "../apis/songlistCategoryApi"

export const useSonglistCategoryStore=defineStore('songlistCategory',{
    state:()=>({
        data: null,
        loading: false,
        error: null,
        categories:null,
        categoriesLength:0,
    }),
    actions: {
        async fetchSongListCategoriesData() {
          this.loading = true
              try {
                const response=await getSonglistCategoryApi()
                // console.log(response);
                this.categories=response.data.data
                this.categoriesLength=this.categories.length
              } catch (error) {
                console.error(error);
              }
              
              
          console.log('success');
        },

      },
})
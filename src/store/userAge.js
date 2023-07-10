import { defineStore } from "pinia";
import axios from 'axios'
export const userAgeStore=defineStore('main',{
    state: () => ({
            
        data: null,
        loading: false,
        error: null,
      
    }),
      actions: {
        async fetchData() {
          this.loading = true
              try {
                const response = await axios.get('/api/getSongLists?categoryId=10000000&limit=25');
                console.log(response.data.response.data.list);
          this.data=response.data.response.data.list
          

              } catch (error) {
                console.error(error);
              }
              console.log(this.data);
          console.log('success');
        },
        
      },
})
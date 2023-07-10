// import { defineStore } from "pinia";
// import axios from 'axios'
// import { getSongDetailApi } from "../apis/songDetailApi";
// export const useGetImageUrlStore=defineStore('getImageUrlStore',{
//     state:()=>({
//         data: null,
//         loading: false,
//         error: null,
//         imgUrlArr:[]
//     }),
//     actions: {
//         async fetchImageUrl(imgId) {
//           console.log(imgId);
//           this.loading = true
//               try {
//                 // const response = await axios.get(`/api/getImageUrl?id=${imgId}`);
                
//                 console.log(response);
//                 this.imgUrlArr.push(response.data.response.data.imageUrl)
//                 // console.log(response.data.response.data.imageUrl);
//                 // console.log(this.imgUrlArr);

//               } catch (error) {
//                 console.error(error);
//               }
              
//         },

//       },
// })
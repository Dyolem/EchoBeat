import { defineStore } from "pinia";
import { getSongDetailApi } from "../apis/songDetailApi";
export const useSongInfoStore=defineStore('songInfoStore',{
    state:()=>({
        data: null,
        loading: true,
        error: null,
        info:null,
        trackInfo:null,
        
        imgUrl:''
    }),
    actions: {
        async fetchSongInfo(songMid) {
            console.log(songMid);
            this.loading=true
                try {
                    // const response = await axios.get(`/api/getSongInfo?songmid=${infoMid}`);
                    const response = await getSongDetailApi(songMid)
                    console.log(response);
                    this.info=response.data.data.info
                    console.log(this.info);
                    this.trackInfo=response.data.data.track_info
                    this.imgUrl=`https://y.gtimg.cn/music/photo_new/T002R300x300M000${this.trackInfo.album.mid}.jpg`
                    console.log(this.trackInfo);
                    // const storedata=JSON.parse(localStorage.getItem('toBePlayedSongs'))
                    // let index= storedata.findIndex(item=>item.mid=songMid)
                    // console.log(index);
                    // this.imgUrl=`https://y.gtimg.cn/music/photo_new/T002R300x300M000${storedata[index].songcover}.jpg`
                    // const res= await axios.get(`/api/getImageUrl?id=${this.trackInfo.album.mid}`)
                    // this.imgUrl=res.data.response.data.imageUrl
                    this.loading = false
                } catch (error) {
                    console.error(error);
            }
              
        },

    },
})
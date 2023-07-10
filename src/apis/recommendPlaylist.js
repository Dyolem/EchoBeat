import httpInstance from "../utils/http";

export function getRecommendPlaylist(id){
     
        return  httpInstance({
            url:`/recommend/playlist?id=${id}`
        })
    
}
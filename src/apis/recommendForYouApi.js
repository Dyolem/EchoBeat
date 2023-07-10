import httpInstance from "../utils/http";

export function getRecommendForYou(id){
    return  httpInstance({
        url:`/recommend/playlist/u`
    })
}
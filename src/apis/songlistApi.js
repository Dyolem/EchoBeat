import httpInstance from "../utils/http";

export function getSonglistApi(id){
    return  httpInstance({
        url:`/songlist/list?category=${id}`
    })
}
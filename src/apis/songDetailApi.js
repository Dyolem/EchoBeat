import httpInstance from "../utils/http";

export function getSongDetailApi(id){
    return  httpInstance({
        url:`/song?songmid=${id}`
    })
}
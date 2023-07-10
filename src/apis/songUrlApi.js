import httpInstance from "../utils/http";

export function getSongUrl(id){
    return  httpInstance({
        url:`/song/urls?id=${id}`
    })
}
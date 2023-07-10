import httpInstance from "../utils/http";

export function getSonglistDetail(id){
    return  httpInstance({
        url:`/songlist?id=${id}`
    })
}
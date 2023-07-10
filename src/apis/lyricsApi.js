import httpInstance from "../utils/http";

export function getLyricsApi(id){
    return  httpInstance({
        url:`/lyric?songmid=${id}`
    })
}
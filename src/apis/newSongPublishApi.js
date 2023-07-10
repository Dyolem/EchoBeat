import httpInstance from "../utils/http";

export function getNewSongPublishApi(id){
    return  httpInstance({
        url:`/new/songs?type=${id}`
    })
}
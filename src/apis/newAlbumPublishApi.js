import httpInstance from "../utils/http";

export function getNewAlbumPublishApi(id){
    return  httpInstance({
        url:`/new/album?type=${id}&num=20`
    })
}
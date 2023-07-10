import httpInstance from "../utils/http";

export function getsongCoverApi(id){
    return  httpInstance({
        url:`/music/photo_new/T002R300x300M000${id}.jpg`
    })
}
import httpInstance from "../utils/http";

export function getSonglistCategoryApi(){
    return  httpInstance({
        url:`/songlist/category`
    })
}
import httpInstance from "../utils/http";

export function getTopCategoryApi(id){
    return  httpInstance({
        url:`/top/category?showDetail=1`
    })
}
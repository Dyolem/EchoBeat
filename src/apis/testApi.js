import httpInstance from "../utils/http";

export function getData(){
    return  httpInstance({
        url:'/songlist/category'
    })
}
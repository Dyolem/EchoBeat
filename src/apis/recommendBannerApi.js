import httpInstance from "../utils/http";

// 首页专辑轮播图图片
export function getRecommendBannerApi(){
    return  httpInstance({
        url:`/recommend/banner`
    })
}
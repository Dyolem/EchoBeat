//总结一下vue-router配置的坑点：所有router-link标签加上to属性，后面不跟地址但是一定要有to属性，
//除非不配置路由，另外使用vue-router之后，之前的所有router-link标签都会变成a标签，页面样式记得修改,
//意思是css里有用router-link作为选择器的记得改成a，使用vue-router之后，以router-link为选择器将全部失效
import {createRouter,createWebHashHistory} from 'vue-router'


import classifiedPlaylist from '../components/homePageSet/classifiedList/classifiedPlaylist.vue'

import homePageClassification from '../components/headerFeatures/home-page-classification.vue'
import songlistDetails from '../components/songlist/songlistDetails.vue'
import songPlay from '../components/songlist/songPlay.vue'
import DefaultLayout from '../components/defaultLayout.vue'
import myMusic from '../components/myMusic.vue'
import headPage from '../components/homePageSet/headPage/headPage.vue'
import songDetails from '../components/songDetails/songDetails.vue'
import { userToBePlayedStore } from '../store/toBePlayed'


const router =createRouter({
    history:createWebHashHistory(),
    routes:[
      {
        path: "/",
        component: DefaultLayout,
        children: [
          {
            path:'',
            component:homePageClassification,
            children:[
              
                {
                  path: "",
                  component: headPage,  //playlistRecommendation 组件已经成为了 homePageClassification 组件的子路由。
                                                      //这意味着需要在 homePageClassification 组件的模板中添加一个 <router-view>，以便展示其子路由对应的组件
                },
                // 由于歌单详情和歌曲详情组件都是动态路由，并且使用了命名，那么分类组件也同样需要使用命名路由来导航
                // 否则会出现/songlist-details/classified-playlist这种情况
                {
                  path:'/classified-playlist',
                  name:'classified-playlist',
                  component:classifiedPlaylist,
                  
                },
                {
                  path: "/songlist-details/:dissid",
                  name:'songlist-details',
                  component: songlistDetails,
                },
                {
                  path:"/song-details/:mid",
                  name:'song-details',
                  component:songDetails
                },
                
            ]
          },
          {
            path:'my-music',
            component:myMusic
          }
        ],
      },
      {
        path:'/song-play',
        name:'song-play',
        component:songPlay
      }
        
      ]
})

// router.beforeEach((to,from,next)=>{
//   const toBePlayed =userToBePlayedStore()
//   const toBePlayedSongs=JSON.parse(localStorage.getItem('toBePlayedSongs')) ||[]
//   toBePlayed.song=toBePlayedSongs
 
//   next()
// })

export default router
<template>
    
    <div class="header">
        <div class="logo">
            <img src="../assets/img/logo.png" alt="">
        </div>
        <div class="nav-link">
            <ul class="nav-li">
                <li class="nav-li-link"><router-link to="" title="音乐馆">音乐馆</router-link></li>
                <li class="nav-li-link"><router-link to="my-music" title="我的音乐">我的音乐</router-link></li>
                
                <li class="nav-li-link" @mouseover="clientshow" @mouseout="clientHide"><router-link to="" title="客户端">客户端</router-link>
                <img src="../assets/img/mark_1.png" alt="">
            <div class="position-control" @mouseout="clientHide" @mouseover="clientshow"><clientVue v-show="showClient" ></clientVue></div></li>
      
                <li class="nav-li-link"><router-link to="" title="开放平台">开放平台</router-link></li>
                <li class="nav-li-link"><router-link to="" title="VIP">VIP</router-link></li>
            </ul>
        </div>
        
        <!-- 搜索、vip、充值部分组件 -->
        <div class="feature">
            <searchVue></searchVue>
            <loginVipCharge></loginVipCharge>
        </div>
    </div>
    
   
</template>

<script setup>
import searchVue from './headerFeatures/search.vue'
import loginVipCharge from './headerFeatures/loginVipCharge.vue'
import clientVue from './headerPopover/client.vue'

import { ref } from 'vue'


//控制客户端下载弹窗显示隐藏
const showClient=ref(false)

// 弹窗这里有个很大的问题，就是光标脱离触发元素后，弹窗就会消失，导致光标在移动到弹窗的过程中，弹窗就已经消失
//这里用的是弹窗留一点范围在触发元素范围内，使光标在没有离开触发范围的时候已经接触到弹窗,这样就不会消失，但这个办法
//不是很好，因为两者之间距离太远没有重叠就不能用这个办法了,另外v-show也是很关键的一点，用v-if是不成功的

function clientshow(){
    showClient.value=true
}

function clientHide (){
    
    showClient.value=false
}

</script>


<style scoped>
   body {
    margin: 0px;
   }
    * {
        margin: 0px;
        padding: 0px;
        list-style: none;
    }
  .position-control {
    position: absolute;
    top: 80px;
    left: 22px;
     
  }
    
    .header {
       
        
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        border-bottom: 1px solid #f2f2f2;
    }
    .logo {
        position: relative;
        width: 173px;
        height: 100px;
    }
    .logo img {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translateY(-50%);
    }
    .nav-li {
        display: flex;
        margin-left: 30px;
        
    }
    /* 如果写成.nav-li-link :hover，又会出现跟行高一样继承到子组件
    里的问题，解决办法要么选择到router-link，要么再去子组件里删除样式l,这里选择去子组件删 */
    .nav-li-link:hover {
        
        cursor: pointer;
    }
     .nav-li-link:first-child a{
        background-color: #31c27c;
        color: #fff;

    }
  
     .nav-li-link:nth-child(3) {
        position:relative;
    }
     .nav-li-link {
       /* 这个行高会继承到client组件里的privilege p元素，还没弄清原理
       解决办法是记得在privilege p里设置行高😓 */
        line-height: 100px;
       
        font-size: 20px;
    }
    .nav-li-link a {
        display: inline-block;
        padding: 0px 20px;
        height: 100px;
        
    }
    .nav-li-link img {
        position: absolute;
        top: 14%;
        left: 60%;
    }
    .feature {
        display: flex;
        align-items: center;
        height: 100px;
    }
    
   
</style>
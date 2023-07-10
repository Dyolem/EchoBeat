<template>
    <div class="login-option">
            <div class="login" @click="loginStatus.isLogin=true" v-if="loginStatus.portrait===''"><router-link to="">登录</router-link></div>
            <div class="user-portrait" v-if="loginStatus.loginStatus">
                <img class="portrait" :src="loginStatus.portrait" alt="">
                <img class="qq-icon" src="https://y.qq.com/mediastyle/yqq/img/login_qq.png?max_age=2592000" alt="">
            </div>
                <div class="vip-occupation"  ref="vipOccupation" @mouseenter="vipExpansion" @mouseleave="vipShrink">
                        <div class="vip"><router-link class="public" to="">开通VIP</router-link></div>
                        <div><router-link class="public" to="">开通绿钻豪华版</router-link></div>
                        <div><router-link class="public" to="">开通付费包</router-link></div>    
                </div>
                <div class="top-up-occupation" ref="topUpOccupation" @mouseenter="topExpansion" @mouseleave="topShrink">
                        <div><router-link class="public" to="">充值</router-link></div>
                        <div><router-link class="public" to="">购买乐币</router-link></div>
                        <div><router-link  class="public" to="">充值饭票</router-link></div>
                </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLoginStatus } from '../../store/loginStatus';

const loginStatus=useLoginStatus()

//用ref获取dom元素对其进行样式修改
    const vipOccupation=ref(null)
    const topUpOccupation=ref(null)
    
function vipExpansion(){
    vipOccupation.value.style.overflow = 'visible'
}
function vipShrink(){
    vipOccupation.value.style.overflow = 'hidden'
}

function topExpansion(){
    topUpOccupation.value.style.overflow = 'visible'
}
function topShrink(){
    topUpOccupation.value.style.overflow = 'hidden'
    
}
</script>

<style scoped>


 .login-option {
        display: flex;
        align-items: center;
        height: 44px;
    }
    
    .login {
        margin:0 14px 0 10px;
        height: 40px;
        line-height: 40px;
        
    }

     .login:hover {
        cursor: pointer;
        color: #31c27c;
    }
    .user-portrait {
        margin-right: 5px;
        position: relative;
        height: 44px;
        width: 44px;
    }
    
    .portrait {
        overflow: hidden;
        height: 44px;
        width: 44px;
        background-color: lightblue;
        border-radius: 50%;
    }
    .qq-icon {
        position: absolute;
        top: 30px;
        right: -2px;
        width: 17px;
        height: 17px;

    }
    /* 以下是两个下拉菜单，有很多样式重复的，后续记得来优化代码 */
    .vip-occupation {
        overflow: hidden;
        margin-right: 10px;
        width: 140px;
        height: 44px;
        
    }
    
    .vip-occupation div{
        /* 宽高会继承父盒子的，这里就不用写了 */
        line-height: 44px;
        text-align: center;
        border: 1px solid #c9c9c9;
        border-top: none;
        border-radius: 3px;
        /* 避免看见header组件底部边框的一条线 */
        background-color: #fff;
        
    }
    .public {
        display: inline-block;
        width: 100%;
        height: 100%;
    }
    .public:hover {
        color: #fff;
    }
    .vip-occupation div:first-child {
        background-color: #31c27c;
   
    }
   
    .vip-occupation div:hover {
        cursor: pointer;
        
        background-color: #31c27c;
    }
    .vip .public {
        color: #fff;
    }
    .top-up-occupation {
        overflow: hidden;
        width: 93px;
        height: 46px;
    }
    .top-up-occupation div{
        line-height: 44px;
        text-align: center;
        border: 1px solid #c9c9c9;
        border-radius: 3px;
        /* 避免看见header组件底部边框的一条线 */
        background-color: #fff;
    
    }
    .top-up-occupation div:hover {
        cursor: pointer;
        background-color: #31c27c;
    }
</style>
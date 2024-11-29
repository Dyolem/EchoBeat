<template>
  <div class="login-option">
    <div class="login" @click="loginStatus.isLogin = true" v-if="!loginStatus.status">
      <router-link to="">登录</router-link>
    </div>
    <div class="user-portrait" v-if="loginStatus.status">
      <img class="portrait" :src="loginStatus.portrait" alt="">
      <img class="qq-icon" src="https://y.qq.com/mediastyle/yqq/img/login_qq.png?max_age=2592000" alt="">
    </div>
  </div>
</template>

<script setup>

import { useLoginStatus } from '../../store/loginStatus';
const loginStatus = useLoginStatus()


</script>

<style scoped>
.login-option {
  display: flex;
  align-items: center;
  height: 44px;
}

.login {
  margin: 0 14px 0 10px;
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
</style>

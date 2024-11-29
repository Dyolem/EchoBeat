<script setup>

// import { watch, ref } from 'vue';
// import { getLoginQR } from '@/apis/loginByQR'
// import { checkQRLogin } from '@/apis/checkLoginByQR'
// import { fetchUserInfo } from '@/apis/getUserInfoApi.js'

import { useLoginStatus } from './store/loginStatus'
import login from './components/login.vue';
const loginStatus = useLoginStatus()
// const QQ_ID = ref(null)

// watch(() => loginStatus.isLogin, () => {
//   console.log(loginStatus.isLogin);
// })
// let loginConfig = {}
// const checkQRLoginInfo = {}
// const loginQRImg = ref(null)
// async function fetchQR(params) {
//   try {
//     const res = await getLoginQR()
//     console.log(res);
//     if (res.status === 200) {
//       loginConfig = {
//         ...res.data
//       }
//       checkQRLoginInfo.ptqrtoken = loginConfig.ptqrtoken
//       checkQRLoginInfo.qrsig = loginConfig.qrsig
//       loginQRImg.value = loginConfig.img
//     }
//   } catch (error) {

//   }
// }

// async function checkQRLoginStatus(params) {
//   console.log(111);

//   try {
//     if (!(checkQRLoginInfo.ptqrtoken && checkQRLoginInfo.qrsig)) return
//     const res = await checkQRLogin(checkQRLoginInfo.ptqrtoken, checkQRLoginInfo.qrsig)
//     if (res.result !== 500) {
//       QQ_ID.value = res.data.id
//     }
//     console.log(res);

//   } catch (error) {

//   }
// }
// async function getUserInfo(params) {
//   try {
//     const res = await fetchUserInfo(QQ_ID.value)
//     console.log(res);

//   } catch (error) {

//   }
// }
</script>

<template>
  <div>
    <!-- <div class="mid-header mid"><headerNav></headerNav></div>
    <div class="mid-classification mid"><homePageClassificationVue></homePageClassificationVue></div> -->
    <!-- 歌单推荐宽度是和窗口一样，用flex保持居中，所以不用添加mid -->
    <!-- 快速验证扫码接口 -->
    <!-- <button class="test" @click="fetchQR">点击获取二维码</button>
    <button class="test" @click="checkQRLoginStatus">检查二维码登录结果</button>
    <button class="test" @click="getUserInfo">获取登录用户信息</button> -->
    <!-- <img :src="loginQRImg" alt=""> -->
    <router-view></router-view>
    <login v-if="loginStatus.isLogin"></login>
  </div>
</template>


<style scoped>
.test {
  width: 200px;
}
</style>

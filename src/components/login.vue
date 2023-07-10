<script setup>


import { ref,watch } from 'vue';
import { useLoginStatus } from '../store/loginStatus';


const loginStatus=useLoginStatus()
const loginType=ref(0)  //0为密码登录，1为扫码快捷登录
const passwordLoginType=ref(0)  //密码登录分邮箱和手机号登录，前者为0，后者为1
const phonenumVertifyStep=ref(1) //手机登录多一步验证码操作，该变量表示操作到第几步

const authority =ref(true)
const password=ref('')
const account=ref('')
const vertificationCode=ref(null)
// loginStatus.fetchLoginData()


watch(account,()=>{
    console.log(account.value);
    if(account.value.includes('@'))
    console.log('邮箱');
    else
    console.log('手机号');
})

const judgeType=()=>{
    if(account.value.includes('@'))
    {
        passwordLoginType.value=0
    }
        
    else
        passwordLoginType.value=1
}
const login =()=>{
    if(phonenumVertifyStep.value===1)
    {
        if(passwordLoginType.value===1)
        {
            // loginStatus.phoneLogin(account.value,password.value)
            console.log('获取验证码');
            phonenumVertifyStep.value=2
            loginStatus.phoneNumber=account
        }
        
       
        else
        {
            console.log('调用email');
            loginStatus.emailLogin(account.value,password.value)
        }
    }
    else
    {
        console.log('验证');
        phonenumVertifyStep.value=2
        loginStatus.vertifyingCode(vertificationCode.value)
    }
    
}
const clearMsg=()=>{
    loginStatus.errorMessage=null
    loginStatus.successMessage=null
}
</script>

<template>
    <div class="fullview-container">
    <div class="login-container">
        <div class="login-head">
            <div class="login-tab">
                <p>QQ登录</p>
                <p>微信登录</p>
            </div>
            <span class="closed-login iconfont icon-chacha" @click="loginStatus.isLogin=false"></span>
        </div>
        
        <div class="login-main">
            <div class="left-main">
                <div class="toggle-parcel" v-if="loginType===0">
                    <h2 class="password-login" >密码登录</h2>
                    <p class="quick-login">推荐使用<a class="quick" @click="loginType=1">快捷登录</a>,防止盗号</p>
                    <div class="login-input-box" >
                        <div class="enter-password-box" v-if="phonenumVertifyStep===1">
                            <input class="diy-input" type="text" name="" id="" placeholder="支持QQ号/邮箱/手机号登录" v-model="account" @focus="clearMsg" @blur="judgeType">
                            <input class="diy-input" type="password" placeholder="请输入密码" v-model="password" @focus="clearMsg" @blur="judgeType">
                        </div>
                        <!-- <p class="prompt-msg" v-if="loginStatus.promptMSg!==''">{{ loginStatus.suc }}</p> -->
                        <div class="vertification-container" v-if="phonenumVertifyStep===2">
                            <input type="text" class="diy-input vertification" placeholder="请输入验证码" v-model="vertificationCode" @focus="clearMsg">
                            <span class="sending-vertification-code" @click="loginStatus.getVertificationCode(account)">获取验证码</span>
                            <p class="reinput" @click="phonenumVertifyStep=1">重新输入密码</p>
                        </div>
                        <div class="error-occupation">
                            <p class="error-tips" v-if="loginStatus.errorMessage!==null"><span class="iconfont icon-tixingshixin"></span>{{ loginStatus.errorMessage }}</p>
                            <p class="success-tips" v-if="loginStatus.successMessage!==null"><span class="iconfont icon-shixingouxuan"></span>{{ loginStatus.successMessage }}</p>
                        </div>
                        
                        <div class="login-btn" @click="login">登录</div>
                    </div>
                </div>
                <div class="toggle-parcel" v-if="loginType===1">
                    <h2 class="password-login" >快捷登录</h2>
                    <p class="quick-login">使用
                        <a class="quick" href="https://im.qq.com/index/" target="_blank">QQ手机版</a>扫码登录,或点击头像授权登录。
                    </p>
                    <div class="login-scan" >
                        <div class="QR">
                            <img src="" alt="">
                        </div>
                        <div class="portrait-box">
                            <div class="portrait">
                                <img src="" alt="">
                            </div>
                            <p>2140584077</p>
                        </div>
                    </div>
                </div>
                
                <div class="login-options">
                    <a target="_blank" href="https://accounts.qq.com/find/password" class="public" v-if="loginType===0">找回密码</a>
                    <a href="javascript:;" class="public" v-if="loginType===1" @click="loginType=0">密码登录</a>
                    <a target="_blank" href="https://ssl.zc.qq.com/v3/index-chs.html?from=pt" class="public">注册账号</a>
                    <a target="_blank" href="https://support.qq.com/products/77942?customInfo=.appid100497308" class="public">意见反馈</a>
                </div>
            </div>
            <div class="right-main">
                
                    <div class="selected-box ">
                        <div class="icon-occupation" @click="authority=!authority">
                            <div class=" icon-box iconfont icon-gou" v-show="authority"></div>
                        </div>
                        <p>全选<a href="">&nbsp;&nbsp;&nbsp;QQ音乐</a>将获得以下权限</p>
                    </div>
               
               
                    <div class="selected-box">
                        <div class="icon-occupation" title="默认授权，不可更改">
                            <div class=" icon-box iconfont icon-gou acquiesce" v-show="true"></div>
                        </div>
                        <p>使用你的QQ头像、昵称信息</p>
                    </div>
           
                    <div class="selected-box">
                        <div class="icon-occupation" @click="authority=!authority">
                            <div class=" icon-box iconfont icon-gou" v-show="authority"></div>
                        </div>
                        <p>你的QQ好友关系</p>
                    </div>
                    <p class="selected-box">授权即同意<a target="_blank" href="https://rule.tencent.com/rule/preview/46a15f24-e42c-4cb6-a308-2347139b1201">服务协议</a>和<a target="_blank" href="https://rule.tencent.com/rule/preview/3fd52bde-6555-453b-9ab8-c5f1f3d22c62">QQ隐私保护指引</a></p>
               
            </div>
        </div>
        <div class="login-foot">
            <div class="download">下载客户端 体验更多内容</div>
        </div>
    </div>
</div>
</template>
<style scoped>
 .fullview-container{
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.2);
    overflow: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1050;
    /* -webkit-overflow-scrolling: touch; */
    outline: 0;
}
.login-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 740px;
    height: 500px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0,0,0,.3);
}
.login-head{
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    height: 60px;
    /* background-color: aquamarine; */
    border-bottom: 1px solid gainsboro;
}
.login-tab {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    width: 250px;
    
}
.closed-login {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 20px;
    height: 20px;
    color: #999999;
    /* background-color: antiquewhite; */
}
.login-main {
    display: flex;
    
    align-items: center;
    width: 100%;
    height: 340px;
    /* background-color: antiquewhite; */
}
.left-main {
    margin: 0 100px;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 350px;
    height: 340px;
    /* background-color: aqua; */
}
.toggle-parcel {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}
.right-main {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    width: 310px;
    height: 200px;
    /* background-color: pink; */
}

.selected-box {
    font-size: 14px;
    margin-bottom: 8px;
    width: 100%;
    display: flex;
    color: #cccccc;
    /* background-color: #cccccc; */
    
}
.selected-box a {
    cursor: pointer;
    color: #0099ff;
}

.icon-occupation {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    border: 1px solid #cccccc;
    border-radius: 50%;
}
.icon-box {
    font-size: 12px;
    text-align: center;
    width: 18px;
    height: 18px;
    line-height: 18px;
    color: #fff;
    background-color: #0099ff;
    border-radius: 50%;
}

.acquiesce {
    background-color: #cccccc;
}
.quick-login {
    margin-bottom: 30px;
    font-size: 14px;
}
.quick {
    cursor: pointer;
    color: #0099ff;
}
.password-login {
    margin: 20px 0 10px 0;
    width: 100%;
    height: 30px;
    text-align: center;
    font-weight: normal;
}
.login-input-box {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    /* align-content: space-around; */
    width: 100%;
    height: 170px;
    /* background-color: pink; */
}
.enter-password-box {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
}
.prompt-msg {
    text-align: center;
}
.diy-input {
    /* 使光标初始位置向右移动15px */
    margin-bottom: 5px;
    text-indent: 15px; 
    width: 100%;
    height: 40px;
    border: 1px solid #cccccc;
    border-radius: 4px;
}
.diy-input::placeholder {
    color: #cccccc;
}
/* 消除获得焦点后的外边框 */
.diy-input:focus {
    outline: none;
}
/* 消除密码框的小眼睛查看密码 */
.diy-input[type="password"]::-ms-reveal {
    display: none;
}
.login-btn {
    /* margin-top: 15px; */
    width: 100%;
    height: 50px;
    line-height: 50px;
    background-color: #0099ff;
    border-radius: 4px;
    text-align: center;
    color: #fff;
    cursor: pointer;
}
.vertification-container {
    text-align: center;
    width: 100%;
    /* background-color: #31c27c; */
}
.vertification{
    margin-right: 20px;
    width: 60%;
}
.sending-vertification-code {
    padding: 3px 5px;
    cursor: pointer;
    color: #cccccc;
    text-align: center;
    border: 1px solid #cccccc;
    border-radius: 3px;
    background-color: #999999;
}
.reinput {
    cursor: pointer;
    color: #999999;
}
.error-occupation {
    width: 100%;
    height: 30px;
    line-height: 30px;
}
.error-tips {
    /* width: 100%;
    height: 30px; */
    line-height: 30px;
    color: #ff4460;
    background-color: #0099ff;
}
.error-tips span {
    margin-right: 5px;
}
.success-tips {
    /* width: 100%;
    height: 30px; */
    line-height: 30px;
    color: lightgreen;
    background-color: #0099ff;
}
.success-tips span {
    margin-right: 5px;
}
.login-scan {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-bottom: 20px;
    width: 100%;
    height: 170px;
    /* background-color: pink; */
}
.QR {
    width: 100px;
    height: 100px;
    /* background-color: #31c37d; */
}
.portrait {
    margin-bottom: 5px;
    width: 100px;
    height: 100px;
    /* background-color: #31c37d; */
}

.login-options {
    display: flex;
    justify-content: space-between;
    width: 100%;
}
.public {
    cursor: pointer;
}
.login-foot {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: pink; */
}
.download {
    width: 250px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background:linear-gradient(90deg, #41d3b5, #31c37d);
    color: #fff;
    border-radius: 20px;
    
}
.download:hover {
    cursor: pointer;
    background: #31c27c;
}

</style>
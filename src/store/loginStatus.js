import { defineStore } from "pinia";
import axios from 'axios'
export const useLoginStatus=defineStore('loginStatus',{
    state: () => ({
            
        data: null,
        loading: false,
        error: null,
        isLogin:false,
        loginStatus:false,
        errorMessage:null,
        successMessage:null,
        code:null,
        promptMSg:'',
        phoneNumber:null,
        phonenumVertifyStep:1,

        portrait:''

      
    }),
      actions: {
        async fetchUserInfo() {
          this.loading = true
              try {
                const response = await axios.get('/QQMusic/user/detail?id=2140584077');
                console.log(response);
                this.portrait=response.data.data.creator.headpic
                console.log(this.portrait);

              } catch (error) {
                console.error(error);
              }
              
          console.log('success');
        },
        async  emailLogin(email,password){
          
          console.log(email,password);
          try {
            const response = await axios.get(`/proxy/login?email=${email}&password=${password}`);
            
            console.log(response);
            this.code= response.data.code
            if(this.code==502)
            {
                this.errorMessage=response.data.msg
                console.log(this.errorMessage);
            }
            else
            {
              this.successMessage='验证成功'
              
              setTimeout(async ()=>{
                this.successMessage=null
                this.isLogin=false
                await  this.setQQcookie()
                await  this.fetchUserInfo()
                this.loginStatus=true
              },1500)
            }

            
      
  
          } catch (error) {
            console.error(error);
          }
        },
        // async  phoneLogin(phonenum,password){
        //   this.phoneNumber=phonenum
        //   console.log(this.phoneNumber);
        //   try {
        //     const response = await axios.get(`/proxy/login/cellphone?phone=15883379137&password=123456789YSm`);
            
        //     console.log(response);
        //     this.code= response.data.code
        //     if(this.code==-462)
        //     {
        //         this.successMessage=response.data.data.blockText
        //         setTimeout(()=>{
        //           this.successMessage=null
        //           this.phonenumVertifyStep=2
        //         },1000)
        //     }
  
        //   } catch (error) {
        //     console.error(error);
        //   }
        // },
        async getVertificationCode (phoneNumber){
          
          try {
            const response = await axios.get(`/proxy/captcha/sent?phone=${phoneNumber}`);
            
            console.log(response);
            
            if(response.data.code==200)
            {
                this.code=response.data.code
            }
            else if(response.data.code==400)
            {
              this.errorMessage=response.data.message
            }
  
          } catch (error) {
            console.error(error);
          }
        },
        async vertifyingCode (vertificationCode){
          console.log(this.phoneNumber);
          try{
            const response = await axios.get(`/proxy/captcha/verify?phone=${this.phoneNumber}&captcha=${vertificationCode}`);
            console.log(response);
            if(response.data.code==503)
            {
              this.errorMessage=response.data.message
            }
            else {
              this.successMessage='验证成功'
              setTimeout(()=>{
                this.successMessage=null
                this.isLogin=false
              },1500)
            }

          } catch(error) {
            console.error(error);
          }
        },
        async setQQcookie() {
          try{
            // 记得登录邮箱更新cookie
            const response =await axios.post('/QQMusic/user/setCookie', {
              data: 'pgv_pvid=3083631504; fqm_pvqid=063ea08d-ea1e-4ab1-bef9-a54e2ff8a288; ts_uid=3970831642; RK=0kOdaeRtSh; ptcz=6650bf8f2c88ebc043a3ff6da17afef22d622202793de134c0544e8e0f6c2d55; euin=ow6Poe4F7enl7z**; tmeLoginType=2; ts_refer=cn.bing.com/; ptui_loginuin=237963907; music_ignore_pskey=202306271436Hn@vBj; fqm_sessionid=2510bc01-0d18-4c94-945f-c8e9d86e1153; pgv_info=ssid=s6581362272; _qpsvr_localtk=0.6751146373339529; login_type=1; wxrefresh_token=; psrf_qqrefresh_token=7059B2D44FFB76F39D50384250EE64B2; wxunionid=; psrf_qqaccess_token=69DBE4C2715DBB663BF9FEB713094DC8; psrf_qqunionid=5F664BC4376F512C177D6A11A7758C10; uin=2140584077; qm_keyst=Q_H_L_5EjK6HOdYRfYH0LhpXITg66Zvlqlwk_9rbn8SE0tC8CP6DLyRp6-QIA; psrf_access_token_expiresAt=1696680728; psrf_musickey_createtime=1688904728; psrf_qqopenid=50228F0DA79CBCFC7AC8A6FC376A0FDD; qqmusic_key=Q_H_L_5EjK6HOdYRfYH0LhpXITg66Zvlqlwk_9rbn8SE0tC8CP6DLyRp6-QIA; qm_keyst=Q_H_L_5EjK6HOdYRfYH0LhpXITg66Zvlqlwk_9rbn8SE0tC8CP6DLyRp6-QIA; wxopenid=; ts_last=y.qq.com/n/ryqq/player'
            },{
              headers:{
                'Content-Type': 'application/json'
              }
            })
            // 光上传cookie还不行，需要再调用下面这个接口，把cookie存在浏览器里
            const res=  await axios.get('/QQMusic/user/getCookie?id=2140584077')
            console.log(response);
          } catch(error) {
            console.error(error);
          }
        }
      },
    
})
import { defineStore } from "pinia"
import axios from "axios"
import { getLoginQR, checkQRLogin } from "../apis/loginByQR"
import { useUserInfoStore } from "./userInfo"

export const useLoginStatus = defineStore("loginStatus", {
  state: () => ({
    data: null,
    loading: false,
    error: null,
    isLogin: false,
    status: false,
    errorMessage: null,
    successMessage: null,
    code: null,
    promptMSg: "",
    scanPrompt: "请扫描二维码",
    phoneNumber: null,
    phonenumVertifyStep: 1,
    QRAuthorityInfo: null,
    QRImg: "",
    UIN: "",
    portrait: "",
  }),
  actions: {
    async fetchUserInfo() {
      this.loading = true
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_API}/user/detail?id=2140584077`,
        )
        console.log(response)
        this.portrait = response.data.data.creator.headpic
        console.log(this.portrait)
      } catch (error) {
        console.error(error)
      }

      console.log("success")
    },
    async emailLogin(email, password) {
      console.log(email, password)
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_LOGIN_API}/login?email=${email}&password=${password}`,
        )

        console.log(response)
        this.code = response.data.code
        if (this.code == 502) {
          this.errorMessage = response.data.msg
          console.log(this.errorMessage)
        } else {
          this.successMessage = "验证成功"

          setTimeout(async () => {
            this.successMessage = null
            this.isLogin = false
            await this.setQQcookie()
            await this.fetchUserInfo()
          }, 1500)
          this.status = true
        }
      } catch (error) {
        console.error(error)
        this.errorMessage = "邮箱格式错误"
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
    async getVertificationCode(phoneNumber) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_LOGIN_API}/captcha/sent?phone=${phoneNumber}`,
        )

        console.log(response)

        if (response.data.code == 200) {
          this.code = response.data.code
        } else if (response.data.code == 400) {
          this.errorMessage = response.data.message
        }
      } catch (error) {
        console.error(error)
      }
    },
    async vertifyingCode(vertificationCode) {
      console.log(this.phoneNumber)
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_LOGIN_API}/captcha/verify?phone=${this.phoneNumber}&captcha=${vertificationCode}`,
        )
        console.log(response)
        if (response.data.code == 503) {
          this.errorMessage = response.data.message
        } else {
          this.successMessage = "验证成功"
          setTimeout(() => {
            this.successMessage = null
            this.isLogin = false
          }, 1500)
        }
      } catch (error) {
        console.error(error)
      }
    },
    async setQQcookie() {
      try {
        // 记得登录邮箱更新cookie
        const response = await axios.post(
          `${import.meta.env.VITE_APP_BASE_API}/user/setCookie`,
          {
            data: "pgv_pvid=3083631504; fqm_pvqid=063ea08d-ea1e-4ab1-bef9-a54e2ff8a288; ptcz=6650bf8f2c88ebc043a3ff6da17afef22d622202793de134c0544e8e0f6c2d55; euin=ow6Poe4F7enl7z**; tmeLoginType=2; RK=qtPVa8RsHh; _qimei_uuid42=18307161605100686137a0813ebe3960b56f47864f; _qimei_fingerprint=447b8d0c38fbf5cb98ae9d559aeb4f34; _qimei_q36=; _qimei_h38=e147d1036137a0813ebe396002000003918307; eas_sid=w1M7g0p9y8g281p3q2b7L9n9k8; LW_sid=n137a153F5T2Q8U1G4j1f1J468; LW_uid=I1e7x1E3H5v2o8w144w1H134z8; psrf_qqopenid=50228F0DA79CBCFC7AC8A6FC376A0FDD; psrf_qqunionid=5F664BC4376F512C177D6A11A7758C10; psrf_qqrefresh_token=3BE6A1B9945947DB585ADDF418B21E21; wxunionid=; wxrefresh_token=; wxopenid=; psrf_qqaccess_token=1374461464FF80137E0D2C1D885D7826; fqm_sessionid=ff05613b-a3fe-41af-b8f1-bc6ed4d9da84; pgv_info=ssid=s2500036100; _qpsvr_localtk=0.9092253187421206; login_type=1; qm_keyst=Q_H_L_63k3Nn1KuKLav9RlPQhjyi6Rer_g8oNTTDZFBnicSfguoho3tnCD8_QKW1LhH19goyiJqfD_qJQ; qqmusic_key=Q_H_L_63k3Nn1KuKLav9RlPQhjyi6Rer_g8oNTTDZFBnicSfguoho3tnCD8_QKW1LhH19goyiJqfD_qJQ; psrf_musickey_createtime=1717686133; uin=2140584077; psrf_access_token_expiresAt=1725462133",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
        // 光上传cookie还不行，需要再调用下面这个接口，把cookie存在浏览器里
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_API}/user/getCookie?id=2140584077`,
        )
        console.log(response)
      } catch (error) {
        console.error(error)
      }
    },
    async fetchQRImg() {
      try {
        const res = await getLoginQR()
        console.log(res)
        if (res.status === 200) {
          const { ptqrtoken, qrsig, img } = res.data
          this.QRAuthorityInfo = {
            ptqrtoken,
            qrsig,
          }
          this.QRImg = img
        }
      } catch (error) {
        throw error
      }
    },
    async checkScanResult({ ptqrtoken, qrsig }) {
      try {
        if (!(ptqrtoken && qrsig)) return
        const res = await checkQRLogin(ptqrtoken, qrsig)
        const { data } = res
        console.log(res)
        console.log(data?.result === 500)
        if (data?.result === 500) {
          this.scanPrompt = data.errMsg
          if (data.refresh) {
            return true
          } else {
            return false
          }
        } else {
          this.UIN = data.id
          this.scanPrompt = data.message
          setTimeout(() => {
            this.isLogin = false
          }, 1000)
          const userInfo = useUserInfoStore()
          userInfo.getUserInfo(this.UIN).then((res) => {
            this.portrait = res.creator.headpic
          })
          this.status = true
          return true
        }
      } catch (error) {}
    },
  },
  persist: {
    pick: ["status", "UIN", "portrait"],
  },
})

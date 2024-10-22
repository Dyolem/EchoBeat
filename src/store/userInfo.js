import { defineStore } from "pinia"
import { fetchUserInfo } from "../apis/getUserInfoApi"
export const useUserInfoStore = defineStore("userInfo", {
  state: () => ({
    data: null,
    loading: false,
    error: null,
    isLogin: false,
    loginStatus: false,
    errorMessage: null,
    successMessage: null,
    code: null,
    portrait: "",
    userInfo: null,
  }),
  actions: {
    async getUserInfo(QQ_ID) {
      try {
        const res = await fetchUserInfo(QQ_ID)
        this.userInfo = res.data.data
        this.portrait = res.data.data.creator.headpic
        return this.userInfo
      } catch (error) {}
    },
  },
})

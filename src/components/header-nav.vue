<template>
  <div class="pc-header">
    <div class="logo">
      <img src="../assets/img/favicon.jpg" alt="" />
      <h1>EchoBeat</h1>
    </div>
    <NavBar>
      <template #nav-item-3>
        <router-link
          to="/client"
          class="nav-link special"
          @mouseout="clientHide"
          @mouseover="clientShow"
        >
          <span class="client-font">客户端</span>
          <div
            class="position-control"
            @mouseout="clientHide"
            @mouseover="clientShow"
          >
            <client v-show="showClient"></client>
          </div>
        </router-link>
      </template>
    </NavBar>
    <!--    搜索、vip、充值部分组件-->
    <div class="feature">
      <searchVue></searchVue>
      <portrait></portrait>
      <!--          <loginVipCharge></loginVipCharge>-->
    </div>
  </div>
  <div class="mobile-header">
    <div class="logo">
      <img src="../assets/img/favicon.jpg" alt="" />
      <h1>EchoBeat</h1>
    </div>
    <searchVue></searchVue>
    <div class="portrait-box">
      <portrait></portrait>
    </div>

    <div class="menu-container" @click="openMenu($event)">
      <echo-icon-park-outline:music-menu
        style="font-size: 2rem; color: #a5a8ad; vertical-align: bottom"
      ></echo-icon-park-outline:music-menu>
    </div>
    <Teleport to="body">
      <Transition name="mask-fade">
        <div class="mask" @click="closeMask($event)" v-if="isShowMenu">
          <div class="menu-option-box" @click="$event.stopPropagation()">
            <NavBar @closeMask="closeMask">
              <template #nav-item-3>
                <router-link
                  to="/client"
                  class="nav-link special"
                  @mouseout="clientHide"
                  @mouseover="clientShow"
                >
                  <span class="client-font">客户端</span>
                  <div
                    class="position-control"
                    @mouseout="clientHide"
                    @mouseover="clientShow"
                  >
                    <client v-show="showClient"></client>
                  </div>
                </router-link>
              </template>
            </NavBar>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import portrait from "./headerFeatures/portrait.vue"
import searchVue from "./headerFeatures/search.vue"
// import loginVipCharge from "./headerFeatures/loginVipCharge.vue"
import NavBar from "./headerFeatures/NavBar.vue"
import client from "./headerPopover/client.vue"

import { ref } from "vue"

const isShowMenu = ref(false)
const preventScroll = (e) => {
  e.preventDefault()
}
function closeMask() {
  isShowMenu.value = false
  window.removeEventListener("wheel", preventScroll, { passive: false })
  window.removeEventListener("touchmove", preventScroll, { passive: false })
}
function openMenu() {
  isShowMenu.value = true
  window.addEventListener("wheel", preventScroll, { passive: false })
  window.addEventListener("touchmove", preventScroll, { passive: false })
}
const showClient = ref(false)
function clientShow() {
  console.log(111)
  showClient.value = true
}

function clientHide() {
  console.log(222)
  showClient.value = false
}
</script>

<style scoped>
.client-font {
  position: relative;
}

.client-font::before {
  position: absolute;
  content: url("../assets/img/mark_1.png");
  top: -20px;
  left: 20px;
}

.nav-client {
  position: relative;
  width: 50px;
  height: 50px;
  background-color: aquamarine;
}

.position-control {
  position: absolute;
  top: 80px;
  left: 22px;
}

.nav-link {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: inherit;
  font-weight: 500;
}

.special-icon {
  position: absolute;
  top: 20px;
  left: 65px;
}

.nav-li {
  display: flex;
  margin-left: 30px;
}

.nav-li-link {
  width: 100px;
  height: 100px;
  background-color: #31c27c;
}

@media screen and (min-width: 900px) {
  .pc-header {
    min-width: 1400px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f2f2f2;
  }

  .mobile-header {
    display: none;
  }

  .logo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 220px;
    height: 100%;
  }

  .logo img {
    width: 50px;
  }

  .feature {
    display: flex;
    align-items: center;
    height: 100px;
  }
}

@media screen and (max-width: 450px) {
  .pc-header {
    display: none;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    max-width: 400px;
    width: 375px;
  }

  .portrait-box {
    margin: 0 10px;
  }

  .pc-nav-link {
    display: none;
  }

  .feature {
    display: none;
  }

  .logo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 120px;
    height: 60px;
  }

  .logo img {
    width: 26px;
  }

  .logo h1 {
    font-size: 18px;
  }
}

.menu-option-box {
  position: absolute;
  right: 0;
  width: 75%;
  height: 100%;
  background-color: #f2f2f2;
}

.mask {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  z-index: 9999;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

.mask-fade-enter-to,
.mask-fade-leave-from {
  opacity: 1;
}

.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: all 0.3s ease-in-out;
}
</style>

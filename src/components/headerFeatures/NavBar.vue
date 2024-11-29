<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, watch } from 'vue'
const route = useRoute()
onMounted(() => {

  console.log(route);
  console.log(route.path);
  watch(() => route.path, () => {
    emit('closeMask')
  })

})
const emit = defineEmits(['closeMask'])

//控制客户端下载弹窗显示隐藏


// 弹窗这里有个很大的问题，就是光标脱离触发元素后，弹窗就会消失，导致光标在移动到弹窗的过程中，弹窗就已经消失
//这里用的是弹窗留一点范围在触发元素范围内，使光标在没有离开触发范围的时候已经接触到弹窗,这样就不会消失，但这个办法
//不是很好，因为两者之间距离太远没有重叠就不能用这个办法了,另外v-show也是很关键的一点，用v-if是不成功的


// const navMap = ref([
//   {
//     id: 0, title: '音乐馆', to: '/',
//   },
//   { id: 1, title: '我的音乐', to: 'my-music' },
//   {
//     id: 2, title: '客户端', to: 'client', comp: () => {
//       return (
//         //   <li class={nav-li-link} mouseover={clientshow} mouseout={clientHide}>
//         //   <router-link to="" title="客户端">客户端</router-link>
//         //   <img src="../assets/img/mark_1.png" alt="">
//         //   <div class="position-control" @mouseout="clientHide" @mouseover="clientshow">
//         //     <client v-show="showClient"></client>
//         //   </div>
//         // </li>
//         <li key={id}>
//           {<router-link to={to} title={title}>{title}</router-link>}
//           {<img src={'../assets/img/mark_1.png'} alt={'抢特权'} />}
//           {<div class="position-control" mouseout={clientHide} mouseover={clientShow}>
//             <client v-show="showClient"></client>
//           </div>}
//         </li>
//       )
//     }
//   },
//   { id: 3, title: '开放平台', to: 'open-platform' },
//   { id: 4, title: 'VIP', to: 'vip' }
// ])
// const navItems = computed(() => {
//   return navMap.value.map(({ id, title, to, comp = null }) => {
//     return (
//       comp && <li key={id}>
//         <router-link to={to} title={title}>{title}</router-link>
//       </li>
//     );
//   });
// })
// const navMap = ref([
//   { id: 0, title: '音乐馆', to: '/' },
//   { id: 1, title: '我的音乐', to: 'my-music' },
//   {
//     id: 2, title: '客户端', to: '', comp: ({ id, to, title }) => (
//       <li key={id} className="nav-li-link" onMouseout={clientHide} onMouseover={clientShow}>
//         <router-link to={to} title={title}>{title}</router-link>
//         <img src="../assets/img/mark_1.png" alt='抢特权' />
//         <div class="position-control" onMouseout={clientHide} onMouseover={clientShow}>
//           {showClient.value && <client></client>}
//         </div>
//       </li>
//     )
//   },
//   { id: 3, title: '开放平台', to: 'open-platform' },
//   { id: 4, title: 'VIP', to: 'vip' }
// ]);

const navItems = ref([
  { id: 1, title: '音乐馆', to: '/' },
  { id: 2, title: '我的音乐', to: '/my-music' },
  { id: 3, title: '客户端', to: '/client' }, // 可通过插槽自定义
  { id: 4, title: '开放平台', to: '/open-platform' },
  { id: 5, title: 'VIP', to: '/vip' }
]);
</script>
<template>
  <div class="nav-bar">
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.id" class="nav-item" :class="{ 'active-nav': route.path === item.to }">
        <!-- 如果传入了自定义插槽则使用插槽，否则使用默认渲染 -->
        <slot :name="`nav-item-${item.id}`">
          <router-link :to="item.to" class="nav-link">{{ item.title }}</router-link>
        </slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.position-control {
  position: absolute;
  top: 80px;
  left: 22px;

}

.nav-bar {
  margin-left: 30px;
  background-color: #f8f8f8;
  height: 100%;
  flex: 1;
}

@media screen and (max-width:450px) {
  .nav-list {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    padding: 0;
  }

  .nav-bar {
    margin-left: 0px;
  }

  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
}

@media screen and (min-width:900px) {
  .nav-list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    padding: 0;
  }
}



.nav-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.active-nav {
  color: #fff;
  border-bottom: 2px solid #42b983;
  background-color: #42b983;
}

.nav-link {
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
  width: 16px;
  height: 16px;
}

.nav-item:not(.active-nav):hover {
  color: #42b983;
}
</style>

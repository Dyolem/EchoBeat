<!-- 该组件已作废，仅作学习参考 -->
<script setup>
import { ref } from "vue";
import { userSonglistStore } from "../store/songlist";

const songlistStore = userSonglistStore()

//控制轮播按钮的渐入渐出
const rightButton=ref(null)
const leftButton=ref(null)

const props= defineProps({
    wheelIndex:{
        type:Number,
        required:true,
    },
    maxLength:{
        type:Number
    }
})

const emit =defineEmits(['upadatedIndex'])


console.log(props.wheelIndex);
const wheelButtonIndex=ref(props.wheelIndex)
//右按钮
    function leftSilde(){
        console.log(props.wheelIndex);
        wheelButtonIndex.value++
        //index的最大值要根据数据源动态判断
        if(wheelButtonIndex.value===props.maxLength)
        wheelButtonIndex.value=0
        emit('upadatedIndex',wheelButtonIndex.value)

      
      
      
   }
   //左按钮
    function rightSilde(){
           
        wheelButtonIndex.value--
        if(wheelButtonIndex.value==-1)
        wheelButtonIndex.value=props.maxLength-1
        emit('upadatedIndex',wheelButtonIndex.value)
      
   }


function showSlideButton(){
   rightButton.value.style.transform='translate(0%,-50%)'
   leftButton.value.style.transform='translate(0%,-50%)'
}
function hideSlideButton(){
   rightButton.value.style.transform='translate(100%,-50%)'
   leftButton.value.style.transform='translate(-100%,-50%)'
}

// 由于使用了setup语法糖，所以即使用ref获取了这个组件的实例，调用里面的方法依然不可以直接调用，需要手动defineExpose暴露
defineExpose({
    showSlideButton,
    hideSlideButton
})
</script>


<template>
    <!-- 左右轮播按钮 -->
        <div class="right-slide-button public-size" ref="rightButton" @click="leftSilde()">
            <span class="iconfont icon-xiangyoujiantou"></span>
        </div>
        <div class="left-slide-button public-size" ref="leftButton" @click="rightSilde()">
            <span class="iconfont icon-xiangzuojiantou"></span>
        </div>
</template>


<style scoped>
    .right-slide-button {
        position: absolute;
        top: 50%;
        right: 0px;
        font-family: icomoon;
        transform: translate(100%,-50%);
    }
    .left-slide-button {
        position: absolute;
        top: 50%;
        left: 0px;
        transform: translate(-100%,-50%);
    }
    .public-size {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100px;
        height: 134px;
        background: rgba(0, 0, 0,.05);
        
        transition: all 0.4s linear;
    }
    .left-slide-button:hover {
        background: rgba(0, 0, 0,.1);
    }
    .right-slide-button:hover {
        background: rgba(0, 0, 0,.1);
    }
    .public-size span{
        font-size: 50px;
        color: #333333;
    }

</style>
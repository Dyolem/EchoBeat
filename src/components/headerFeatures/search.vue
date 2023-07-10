<template>
     <div class="search-occupation" ref="searchOccupation">
            <div class="search-input">
                <input type="text" placeholder="搜索音乐、MV、歌单、用户"   @focus="heightincre" @focusout="heightdecre">
            </div>
            <!-- 搜索栏动画还未完成，记得回来改 -->
            <div class="history-search" ref="heddcre">
                
            </div>
                <span></span>
        </div>
</template>

<script setup>
import {ref}from 'vue'
    const searchOccupation=ref(null)
    const heddcre=ref(null)

    function heightincre(){
    console.log('success');
    heddcre.value.style.height='80px'
    
}
function heightdecre(){
    console.log('leave success');
    heddcre.value.style.height='0px'
    
}
</script>

<style scoped>
.search-occupation {
        
        width: 225px;
        height: 40px;
        margin: 0 15px;
        line-height: 40px;
        border: 1px solid #c9c9c9;
        border-radius: 3px;
        
    }
    .search-input input {
        width: 190px;
        margin-left: 5px;
        font-size: 15px;
        border: 0;
        color: #999999;
        outline: none;
        
    }
    .history-search {
        height: 0px;
        border: 1px solid #c9c9c9;
        background-color: #fff;
        transition: all 0.3s linear;
       
    }
</style>
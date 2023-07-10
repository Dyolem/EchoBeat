<template>
    <div class="client">
        <div class="privilege">
            <p class="privilege-content">HQ高品质 全员开启</p>
            <p class="privilege-content">独家音效 全面升级</p>
            <p class="privilege-content">轻盈视觉 动态皮肤</p>
        </div>
        <div class="download">
            <p class="download-link"><router-link to="">下载体验</router-link></p>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
    .client {
        display: flex;
        
        justify-content: center;
        flex-wrap: wrap;
        width: 180px;
        height: 180px;
        border-radius: 5px;
        box-shadow: 1px 1px 2px 1px #cdcdcd,
        -1px -1px 2px 1px #cdcdcd;
        font-size: 14px;
        background-color: #fff;
        /* 避免客户端遮住home-page-classification组件 */
        z-index: 99;
        
    }
    .privilege {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
         margin:15px 0px 3px 30px;
       
        
       
        
    }
    .privilege .privilege-content {
        line-height: 20px;
        margin-bottom: 10px;
        color: #000;
        cursor:text;
    }
    .download {
        width: 150px;
        height: 32px;
        line-height: 32px;
        border-radius: 16px;
        background:linear-gradient(90deg, #41d3b5, #31c37d);
        
    }
    .download .download-link:hover {
        background-color: #31c27c;
        border-radius: 16px;
    }
    .download .download-link {
        text-align: center;
       
        cursor: pointer;
    }
    .download .download-link a {
        color: #fff;
    }
</style>
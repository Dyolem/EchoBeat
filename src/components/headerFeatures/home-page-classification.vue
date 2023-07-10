<template>
    <div class="classification mid-classification mid">
        <ul>
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="">歌手</router-link></li>
            <li><router-link to="">新碟</router-link></li>
            <li><router-link to="">排行榜</router-link></li>
            <li><router-link :to="{name:'classified-playlist'}">分类歌单</router-link></li>
            <li><router-link to="">电台</router-link></li>
            <li><router-link to="">MV</router-link></li>
            <li><router-link to="">数字专辑</router-link></li>
        </ul>
        
        
    </div>
    <router-view></router-view>
    
</template>
<script>


</script>
<style scoped>

.classification {
    width: 1000px;
    display: flex;
    justify-content: center;
}
.classification ul {
    display: flex;
    
}
.classification ul li {
    padding: 0 27px;
    height: 62px;
    line-height: 62px;
    font-size: 16px;
    list-style: none;
    
}


</style>
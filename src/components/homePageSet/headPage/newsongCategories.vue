<script setup>
import { ref, watch } from 'vue';
import { useNewSongStore } from '../../../store/newSong';
const newsong= useNewSongStore()


const newsongCategories=ref([
    {
        typeId:0,
        category:'最新'
    },
    {
        typeId:1,
        category:'内地'
    },
    {
        typeId:2,
        category:'港台'
    },
    {
        typeId:3,
        category:'欧美'
    },
    {
        typeId:4,
        category:'韩国'
    },
    {
        typeId:5,
        category:'日本'
    }
])
const selectedIndex=ref(0)
const getNewSongLists=(id,idx)=>{
    selectedIndex.value=idx
    newsong.fetchNewSong(id)
}

// emit作用：1、重置轮播索引：传递一个变化的索引到headPage组件，再传递给playlistRecommendation组件
//          2、传递列表长度，headPage组件将根据该值计算渲染的轮播页面个数
const emit =defineEmits(['passNewSongListsLength'])
watch(()=>newsong.loaded,()=>{
    emit('passNewSongListsLength',{
        id:'newSongPublish',
        listLength:newsong.listLength,
        resetIndex:selectedIndex.value
    })
    console.log(111111111);
})

</script>

<template>
    <div class="category-name-container">
        
        <div class="category-name" :class="selectedIndex===index?'selected':''"
            v-for="(item,index) in newsongCategories" @click="getNewSongLists(item.typeId,index)">{{ item.category }}</div>
    </div>
</template>

<style scoped>
.selected {
    color: #31c27c;
}
.category-name-container {
    display: flex;
    justify-content: center;
}
.category-name {
    margin:30px 25px
}
.category-name:hover {
    cursor: pointer;
    color: #31c27c;
}
</style>
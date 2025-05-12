<script setup>
import { ref, computed, onUnmounted, watchEffect } from "vue"

import Menu from "@/views/daw/components/context-menu/Menu.vue"
import {
  createNewProject,
  loadProject,
  projectList,
  hasSavedCurrentProject,
  isLoading,
} from "@/core/history/index.js"
import { switchProjectAudio } from "@/store/daw/audio-binary-data/index.js"

function switchProject(projectId) {
  return Promise.all([loadProject(projectId), switchProjectAudio(projectId)])
}
const globalMenuIconsSet = {
  GLOBAL_MENU: "material-symbols:menu-rounded",
  PROJECT_SUB_MENU: "ph:music-note-light",
  NEW_PROJECT: "material-symbols-light:add-box-outline-rounded",
  RECENT_PROJECT: "material-symbols:tab-recent",
  GLOBAL_DOWNLOAD: "ep:download",
  GLOBAL_EDIT: "fluent:edit-32-regular",
  UNDO: "octicon:undo-24",
  REDO: "octicon:redo-24",
  GLOBAL_TOOLS: "iconoir:angle-tool",
  CYCLE: "oi:loop",
  GLOBAL_VIEW: "lets-icons:view",
  GRID_SIZE: "material-symbols-light:grid-on-outline",
  FULL_SCREEN: "material-symbols-light:fullscreen-rounded",
  EXIT_FULL_SCREEN: "material-symbols-light:fullscreen-exit-rounded",
  GLOBAL_SETTINGS: "tdesign:setting",
  SNAP_MAGNET: "bxs:magnet",
}
const getRecentProjects = computed(() => {
  return projectList.value.map(({ id, name }) => ({
    value: id,
    label: name,
    async clickHandler() {
      new Promise((resolve, reject) => {
        _resolve = resolve
        _reject = reject
        if (!hasSavedCurrentProject.value) {
          dialogVisible.value = true
        } else {
          resolve()
        }
      }).finally(() => {
        switchProject(this.value)
          .catch((reason) => {
            ElNotification({
              title: "Error",
              message: reason,
              type: "error",
            })
          })
          .finally(() => {
            _resolve = null
            _reject = null
          })
      })
    },
  }))
})
const fullScreenController = new AbortController()
const globalMenuData = ref([
  {
    value: "global menu",
    label: "",
    icon: {
      name: globalMenuIconsSet.GLOBAL_MENU,
      style: {
        fontSize: "24px",
      },
    },
    children: [
      {
        value: "project",
        label: "Project",
        icon: {
          name: globalMenuIconsSet.PROJECT_SUB_MENU,
        },
        children: [
          {
            value: "New Project",
            label: "New Project",
            icon: {
              name: globalMenuIconsSet.NEW_PROJECT,
            },
            async clickHandler() {
              await createNewProject()
            },
          },
          {
            value: "Recent Projects",
            label: "Recent Projects",
            icon: {
              name: globalMenuIconsSet.RECENT_PROJECT,
            },
            children: () => getRecentProjects.value,
          },
          {
            value: "Download",
            label: "Download",
            icon: {
              name: globalMenuIconsSet.GLOBAL_DOWNLOAD,
            },
            children: [
              {
                value: "Tracks",
                label: "Tracks",
              },
              {
                value: "Mixdown As",
                label: "Mixdown As",
              },
            ],
          },
        ],
      },
      {
        value: "edit",
        label: "Edit",
        icon: {
          name: globalMenuIconsSet.GLOBAL_EDIT,
        },
        children: [
          {
            value: "undo",
            label: "Undo",
            icon: {
              name: globalMenuIconsSet.UNDO,
            },
          },
          {
            value: "redo",
            label: "Redo",
            icon: {
              name: globalMenuIconsSet.REDO,
            },
          },
        ],
      },
      {
        value: "tools",
        label: "Tools",
        icon: {
          name: globalMenuIconsSet.GLOBAL_TOOLS,
        },
        children: [
          {
            value: "cycle",
            label: "Cycle",
            icon: {
              name: globalMenuIconsSet.CYCLE,
            },
          },
        ],
      },
      {
        value: "view",
        label: "View",
        icon: {
          name: globalMenuIconsSet.GLOBAL_VIEW,
        },
        children: [
          {
            value: "grid size",
            label: "Grid Size",
            icon: {
              name: globalMenuIconsSet.GRID_SIZE,
            },
            children: [
              {
                value: "Tracks",
                label: "Tracks",
              },
              {
                value: "Mixdown As",
                label: "Mixdown As",
              },
            ],
          },
          {
            value: "full screen",
            label: "Full Screen",
            clickHandler({ index, indexPath, active }) {
              // 切换全屏的核心逻辑
              const toggleHandler = () => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen()
                } else {
                  document.exitFullscreen()
                }
              }

              // 状态更新函数
              const updateState = () => {
                const isFullscreen = !!document.fullscreenElement
                this.value = isFullscreen ? "exit full" : "full screen"
                this.label = isFullscreen ? "Exit Full" : "Full Screen"
                this.icon.name = isFullscreen
                  ? globalMenuIconsSet.EXIT_FULL_SCREEN
                  : globalMenuIconsSet.FULL_SCREEN
              }

              // 首次点击时绑定监听器
              if (!this._fullscreenBound) {
                document.addEventListener(
                  "fullscreenchange",
                  updateState.bind(this),
                  { signal: fullScreenController.signal },
                )
                this._fullscreenBound = true
              }

              // 执行切换并立即更新状态
              toggleHandler()
              updateState()
            },
            icon: {
              name: globalMenuIconsSet.FULL_SCREEN,
            },
          },
        ],
      },
      {
        value: "settings",
        label: "Settings",
        icon: {
          name: globalMenuIconsSet.GLOBAL_SETTINGS,
        },
        children: [
          {
            value: "snap",
            label: "Snap To Grid",
            icon: {
              name: globalMenuIconsSet.SNAP_MAGNET,
            },
          },
        ],
      },
    ],
  },
])
const dialogVisible = ref(false)

const handleClose = (done) => {
  done()
  _resolve?.()
}
let _resolve = null
let _reject = null
function saveProjectHandler(isSave) {
  if (isSave) {
    _resolve?.()
  } else {
    _reject?.()
  }
  dialogVisible.value = false
}
let loading = null
watchEffect(() => {
  if (isLoading.value) {
    loading = ElLoading.service({
      lock: true,
      text: "Loading",
      background: "rgba(0, 0, 0, 0.7)",
    })
  } else {
    loading?.close()
  }
})
onUnmounted(() => {
  fullScreenController.abort()
})
</script>

<template>
  <div class="global-menu-container">
    <Menu :menu-data="globalMenuData"></Menu>
  </div>
  <div class="save-state-dialog">
    <el-dialog
      v-model="dialogVisible"
      title="Save Tips"
      width="500"
      :center="true"
      :align-center="true"
      :before-close="handleClose"
    >
      <span
        >Your edited content has not been saved yet. Do you want to save
        it</span
      >
      <template #footer>
        <div class="dialog-footer">
          <el-button
            round
            color="#343940"
            @click="() => saveProjectHandler(false)"
            ><span class="dialog-button">Don't Save</span></el-button
          >
          <el-button
            round
            :dark="true"
            color="#ffffff"
            type="primary"
            @click="() => saveProjectHandler(true)"
          >
            <span class="dialog-button">Save</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.global-menu-container :deep(.el-menu--vertical) {
  --el-menu-item-height: 50px;
  --el-menu-bg-color: none;
  --el-menu-hover-text-color: none;
  --el-menu-hover-bg-color: none;
  border: none;
}
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20px;
}
.save-state-dialog :deep(.el-dialog) {
  font-weight: 500;
  border: 1px solid #282e33;
  --el-dialog-bg-color: #101214;
  --el-text-color-primary: #ffffff;
  --el-text-color-regular: #ffffff;
  --el-color-primary: #ffffff;
}
.dialog-button {
  width: 150px;
  text-align: center;
  font-weight: 600;
}
</style>

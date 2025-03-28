<script setup>
import Menu from "@/views/daw/components/context-menu/Menu.vue"
import { ref } from "vue"
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
          },
          {
            value: "Recent Projects",
            label: "Recent Projects",
            icon: {
              name: globalMenuIconsSet.RECENT_PROJECT,
            },
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
</script>

<template>
  <div class="global-menu-container">
    <Menu :menu-data="globalMenuData"></Menu>
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
</style>

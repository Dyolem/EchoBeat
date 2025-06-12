import { defineStore } from "pinia"
import { ref } from "vue"
import { ID_SET } from "@/constants/daw/index.js"
import {
  createNewProject,
  defaultProjectTemplate,
  loadProject,
  saveCurrentProject,
  snapshotProjectDetails,
} from "@/core/history/index.js"
import { switchProjectAudio } from "@/store/daw/audio-binary-data/index.js"

export const useProjectStore = defineStore("project-detail", () => {
  const currentProjectId = ref("")
  const hasSavedCurrentProject = ref(false)
  const projectDetailsInfo = ref({})

  /**
   *
   * @param {Object} projectDetails
   * @param {string} [projectDetails.projectName]
   * @param {string} [projectDetails.lastSavedDate]
   * @param {string} [projectDetails.genre]
   * @param {string} [projectDetails.description]
   * @param {boolean} [projectDetails.explicitContent]
   * @param {boolean} [projectDetails.forkable]
   */
  function updateProjectDetails(projectDetails) {
    const _projectDetails = projectDetails
    if (!_projectDetails) return
    console.log(_projectDetails)
    console.log(projectDetails)
    Object.keys(_projectDetails).forEach((key) => {
      if (_projectDetails[key] !== undefined) {
        projectDetailsInfo.value[key] = _projectDetails[key]
      }
    })
    updateSavedState(false)
    snapshotProjectDetails()
  }
  async function createProject({ projectName = "New Project" } = {}) {
    const { id } = await createNewProject({ projectName })
    updateCurrentProjectId(id)
  }
  function openRecentProject() {}
  function saveProject() {
    saveCurrentProject()
    hasSavedCurrentProject.value = true
  }
  function updateSavedState(state) {
    if (typeof state !== "boolean") return

    hasSavedCurrentProject.value = state
  }
  function updateCurrentProjectId(id) {
    currentProjectId.value = id
  }
  async function switchProject(projectId) {
    updateCurrentProjectId(projectId)
    return Promise.all([loadProject(projectId), switchProjectAudio(projectId)])
  }
  return {
    defaultProjectTemplate,
    currentProjectId,
    hasSavedCurrentProject,
    projectDetailsInfo,
    updateProjectDetails,
    updateCurrentProjectId,
    updateSavedState,
    createProject,
    openRecentProject,
    saveProject,
    switchProject,
  }
})

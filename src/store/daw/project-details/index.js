import { defineStore } from "pinia"
import { ref } from "vue"

export const useProjectStore = defineStore("project-detail", () => {
  const projectDetailsInfo = ref({
    projectName: "untitled",
    lastSavedDate: "",
    genre: "",
    description: "",
    explicitContent: false,
    forkable: false,
  })

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
    Object.keys(projectDetails).forEach((key) => {
      if (projectDetails[key] !== undefined) {
        projectDetailsInfo.value[key] = projectDetails[key]
        console.log(projectDetailsInfo.value)
      }
    })
  }
  return {
    projectDetailsInfo,
    updateProjectDetails,
  }
})

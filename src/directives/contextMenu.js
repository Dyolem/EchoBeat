// const vContextMenu = {
//   mounted(el, binding, vnode) {
//     console.log(el)
//     console.log(binding)
//     console.log(vnode)
//     el.addEventListener("contextmenu", (event) => {
//       event.preventDefault()
//       console.log(event.offsetX, event.offsetY)
//       const diyMenu = document.createElement("div")
//       const left = event.clientX - el.getBoundingClientRect().left
//       const top = event.clientY - el.getBoundingClientRect().top
//       console.log(left, top)
//       diyMenu.style.position = "absolute"
//       diyMenu.style.left = left + "px"
//       diyMenu.style.top = top + "px"
//       diyMenu.style.width = "200px"
//       diyMenu.style.height = "50px"
//       diyMenu.style.backgroundColor = "antiquewhite"
//       diyMenu.style.border = "1px solid #ccc"
//       diyMenu.style.padding = "5px"
//       diyMenu.style.zIndex = "1000"
//       diyMenu.innerHTML = `<div>test</div>`
//       el.appendChild(diyMenu)
//     })
//   },
// } export default vContextMenu

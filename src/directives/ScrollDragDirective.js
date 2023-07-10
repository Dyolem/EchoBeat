// ScrollDragDirective.js
export default {
    mounted(el) {
      let isDragging = false;
      let startPosition = 0;
      let startScrollPosition = 0;
  
      el.addEventListener('mousedown', handleDragStart);
      el.addEventListener('mousemove', handleDrag);
      el.addEventListener('mouseup', handleDragEnd);
  
      function handleDragStart(event) {
        isDragging = true;
        startPosition = event.clientY;
        startScrollPosition = el.scrollTop;
      }
  
      function handleDrag(event) {
        if (!isDragging) return;
  
        const deltaY = event.clientY - startPosition;
        el.scrollTop = startScrollPosition - deltaY;
      }
  
      function handleDragEnd() {
        isDragging = false;
      }
    },
    unmounted(el) {
      el.removeEventListener('mousedown', handleDragStart);
      el.removeEventListener('mousemove', handleDrag);
      el.removeEventListener('mouseup', handleDragEnd);
    }
  };
  
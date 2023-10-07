export function throttle(func, delay) {
    let lastExecTime = 0;
    let timeoutId;
  
    return function () {
      const context = this;
      const args = arguments;
      const currentTime = Date.now();
  
      if (currentTime - lastExecTime < delay) {
        clearTimeout(timeoutId);
  
        timeoutId = setTimeout(function () {
          lastExecTime = currentTime;
          func.apply(context, args);
        }, delay);
      } else {
        lastExecTime = currentTime;
        func.apply(context, args);
      }
    };
  }
  
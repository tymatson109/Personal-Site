export function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function respondToVisibility(element, callback) {
    var options = {
      root: document.documentElement,
      threshold: [1]
    };
  
    var observer = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        console.log(`${element} has just become visible in screen`);
      }
      entries.forEach(entry => {
        callback(entry.intersectionRatio > 0, element);
      });
    }, options);
  
    observer.observe(element);
  }  
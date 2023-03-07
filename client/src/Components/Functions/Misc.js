export function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function respondToVisibility(element, callback) {
    var options = {
      root: document.documentElement,
      threshold: [0.6]
    };
  
    var observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        callback(entry.intersectionRatio > 0, element);
      });
    }, options);
  
    observer.observe(element);
}  
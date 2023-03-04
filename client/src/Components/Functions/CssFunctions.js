export const nameScramble = (e) => {
    const text = e.target.innerText
    let iterations = 0;

    const interval = setInterval(() => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      e.target.innerText = text.split("")
        .map((letter, index) => {
          if(index < iterations) {
            return e.target.dataset.value[index]
          }

          return letters[Math.floor(Math.random()*26)]
        })
        .join("");

        if (iterations >= e.target.dataset.value.length) {
          clearInterval(interval)
        }
        iterations += 1 / 2;
    }, 40)      
}

export const write = (e) => {
    e.classList.add('title-active')
    let string = ""
    const text = e.innerHTML
    let iterations = 0;

    const interval = setInterval(() => {

        const letter = text.split("")[iterations];
        string = string + letter;
        e.innerHTML = string

        if (iterations + 1 >= text.length) {
        clearInterval(interval)
        e.classList.add('title-active')
        }
        iterations += 1;
    }, 140)
};
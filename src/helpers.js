export { addSvg, clickedOnElement, logger, equal }

function addSvg(svg, ...className) {
    const image = new Image();
    image.src = svg;
    image.classList.add(...className);
    return image
}

// function clickedOnElement(event, classNames = []) {
//     const path = event.composedPath();
//     for (let i = 0; i < path.length; i++) {
//         if (path[i].classList && classNames.some(name => path[i].classList.contains(name))) {
//             console.log(`one className was in path ${path[i]}`)
//             return true;
//         }
//     }
//     return false
// }

const clickedOnElement = (event, classNames = []) => {
    if (classNames.some(name => event.composedPath()[0].classList.contains(name))){
        return event.target
    }
    return false
}

const counter = (() => {
    let count = 0;
    const add = () => ++count;
    return { add }
})();

function logger(text) { return console.log(`${counter.add()}. ${text}`) }

function equal(a, b) { return a.reduce((p, c, i) => (c === b[i] && p), true) }

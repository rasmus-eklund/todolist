export { addSvg, clickedOnElement, logger, equal, dateToStr, strToDate, sortByDate, sortByTitle }
import { format } from 'date-fns';

function addSvg(svg, ...className) {
    const image = new Image();
    image.src = svg;
    image.classList.add(...className);
    return image
}

const clickedOnElement = (event, classNames = []) => {
    if (classNames.some(name => event.composedPath()[0].classList.contains(name))) return event.target;
    return false
}

const counter = (() => {
    let count = 0;
    const add = () => ++count;
    return { add }
})();

function logger(text) { return console.log(`${counter.add()}. ${text}`) }

function equal(a, b) { return a.reduce((p, c, i) => (c === b[i] && p), true) }

const dateToStr = d => {
    if (d === 'No date') return 'No date'
    return format(d, 'yyyy-MM-dd')
}

const strToDate = s => {
    if (s === 'No date' || s === '') return 'No date'
    return new Date(s.split('-'))
}

const sortByDate = (asc = true) => (a, b) => {
    const A = a.get().date;
    const B = b.get().date;
    if (A === 'No date' && B) return 1;
    else if (A && B === 'No date') return -1;
    else return asc ? (A - B) : (B - A);
}

const sortByTitle = (asc = true) => (a, b) => {
    const A = a.get().title;
    const B = b.get().title;
    return asc ? ((A < B) ? -1 : 1): ((A > B) ? -1 : 1);
};
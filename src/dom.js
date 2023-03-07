
function cE(type, className, parent, textContent) {
    const element = document.createElement(type)
    if (className) {
        element.className = className
    }
    if (parent) {
        parent.appendChild(element)
    }
    if (textContent){
        element.textContent = textContent;
    }
    return element
};

const setupBoard = () => {
    const container = document.getElementById('container');
    const board = cE('div', 'board', container);
    const projects = cE('div', 'projects', board);
    const posts = cE('div', 'posts', board);
    const addProj = cE('div', 'addProj', board);
    cE('p', false, addProj, '+')
    const addProjDrop = cE('div', 'addProjDrop', board);

    function bind_addProj(fun) {
        addProj.addEventListener('click', fun);
    }
    return {
        bind_addProj
    }
};

export { DOM }
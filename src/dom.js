// Fix so that its not possible to edit multiple project names simultaneously

import Edit from '../assets/pencil.svg';
import Delete from '../assets/delete.svg';
import Plus from '../assets/plus-circle-outline.svg'

const counter = (() => {
    let count = 0;
    const add = () => ++count;
    return { add }
})();

const logger = text => console.log(`${counter.add()}. ${text}`);

const equal = (a, b) => a.reduce((p, c, i) => (c === b[i] && p), true);

function addSvg(svg, className) {
    const element = document.createElement('div');
    const image = new Image();
    image.src = svg;
    element.appendChild(image);
    element.className = 'Image';
    element.classList.add(className)
    return element
}

function cE(className, parent = false, textContent = false) {
    const element = document.createElement('div');
    if (className) { className.forEach(name => element.classList.add(name)) };
    if (parent) { parent.appendChild(element) };
    if (textContent) {
        textContent.forEach((text) => {
            const p = document.createElement('p');
            p.textContent = text;
            element.appendChild(p);
        });
    }
    return element
}

function getItemIndexName(element) {
    const index = [...element.parentElement.parentElement.children].indexOf(element.parentElement);
    const name = element.parentElement.dataset.name;
    return [index, name]
}

function clearElementChildren(element) {
    [...element.children].forEach((i => i.remove()));
}

function addInputBox(element, placeholder = false, focus = true) {
    const input = document.createElement('input');
    element.appendChild(input);
    if (placeholder) {
        input.placeholder = placeholder;
    }
    if (focus) {
        input.focus();
    }
    return input
}

const setupBoard = (projects) => {
    let currentName = projects.get(0).getName();
    let currentIndex = 0;
    const container = document.getElementById('container');
    const board = cE(['board'], container);
    const posts = cE(['posts'], board);
    const projectButton = createProjectButton();
    projectButton.decideTitle();
    let projectManager;
    populatePosts();

    function createProjectButton() {
        const div = document.createElement('div');
        const p = document.createElement('p');
        div.className = 'addProjectButton';
        div.appendChild(p);
        div.addEventListener('click', toggleProjectManager);
        board.appendChild(div);
        const removeEventList = () => div.removeEventListener('click', toggleProjectManager);
        const rename = (name, index) => {
            p.textContent = name;
            p.dataset.index = index; // keep track of which project is currently selected
        }
        rename(currentName, currentIndex);
        const getData = () => { return { name: p.textContent, index: parseInt(p.dataset.index) } };
        const getButton = () => div;
        const decideTitle = () => {
            if (projects.len() === 0) {
                currentIndex = null;
                currentName = 'Empty';
            }
            rename(currentName, currentIndex);
        }
        return { rename, getData, removeEventList, getButton, decideTitle };
    }

    function createItem() {
        clearElementChildren(this);
        const input = addInputBox(this);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                currentName = input.value;
                projects.addProject(currentName);
                currentIndex = projects.len() - 1;
                logger(`Item created: ${currentName}`);
                readItem(null, currentIndex);
                refreshProjects();
            }
            if (e.key === 'Escape') {
                refreshProjects();
            }
        });
    }

    function readItem(e, index) {
        if (index === undefined) {
            currentIndex = this.dataset.index;
            currentName = this.dataset.name;
        } else {
            currentIndex = index;
            currentName = projects.get(index).getName();
        }
        logger(`Item selected: ${currentName}`);
        populatePosts();
        toggleProjectManager();
    }

    function updateItem(e) {
        e.stopPropagation();
        const [index, name] = getItemIndexName(this);
        const project = this.parentElement;
        project.removeEventListener('click', readItem);
        clearElementChildren(project);
        const input = addInputBox(project, name);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                projects.renameProject(index, input.value);
                currentName = input.value;
                logger(`Item updated: ${name} -> ${currentName}`);
                projectButton.decideTitle();
                refreshProjects();
            }
            if (e.key === 'Escape') {
                refreshProjects();
            }
        });
    }

    function deleteItem(e) {
        e.stopPropagation();
        let [index, name] = getItemIndexName(this);
        logger(`Item deleted: ${name}`)
        projects.remove([index]);
        if (equal(Object.values(projectButton.getData()), [name, index])) {
            currentIndex = (currentIndex - 1 < 0) ? 0 : currentIndex - 1
            currentName = projects.get(currentIndex).getName();
        }
        projectButton.decideTitle();
        refreshProjects();
        populatePosts();
    }

    function addProject(parent, text = false, index = false, isProject = true) {
        const project = cE(['project'], parent, isProject ? [text] : false);
        project.dataset.name = text;
        project.dataset.index = index;
        if (isProject) {
            const remove = addSvg(Delete, 'removeProjectButton');
            const edit = addSvg(Edit, 'editProjectButton');
            project.appendChild(remove);
            project.appendChild(edit);
            remove.addEventListener('click', deleteItem, { once: true });
            edit.addEventListener('click', updateItem, { once: true });
            project.addEventListener('click', readItem, { once: true });
        } else {
            project.appendChild(addSvg(Plus, 'plus'));
            project.addEventListener('click', createItem, { once: true });
            project.classList.add('addProjectDiv');
        }
        parent.appendChild(project);
    }

    function createPost() {

    }

    function readPost() {

    }

    function updatePost() {

    }

    function deletePost() {

    }

    function addPost(parent, text = false, date = false, index = false, ispPost = true) {
        const post = cE(['post'], parent, ispPost ? [text, date] : false);
        post.dataset.name = text;
        post.dataset.index = index;
        if (ispPost) {
            const remove = addSvg(Delete, 'removePostButton');
            const edit = addSvg(Edit, 'editPostButton');
            post.appendChild(remove);
            post.appendChild(edit);
        } else {
            post.appendChild(addSvg(Plus, 'plus'))
        }
    }

    function toggleProjectManager() {
        if (projectManager === undefined || !projectManager.isConnected) {
            populateProjects();
            logger(`Projects toggled on (${currentName}).`);
        } else {
            projectManager.remove();
            logger(`Projects toggled off (${currentName})`);
        }
        projectButton.decideTitle();
    }

    function refreshProjects() {
        projectManager.remove();
        populateProjects();
        logger(`Projects refreshed (${currentName})`);
    }

    function populateProjects() {
        projectManager = cE(['projectManager'], board);
        for (let i = 0; i < projects.len(); i++) {
            const title = projects.get(i).getName();
            addProject(projectManager, title, i)
        }
        addProject(projectManager, false, false, false);
    }

    function populatePosts() {
        clearElementChildren(posts);
        if (currentIndex !== null) {
            const project = projects.get(currentIndex);
            for (let i = 0; i < project.len(); i++) {
                const data = project.get(i).get();
                addPost(posts, data.title, data.date, i)
                // cE(['post'], posts, [data.title]);
            }
            addPost(posts, false, false, false, false)
            logger(`Render posts (${currentName})`)
        }
    }
}

export { setupBoard }
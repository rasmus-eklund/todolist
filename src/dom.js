// Fix so that its not possible to edit multiple project names simultaneously

import Edit from '../assets/pencil.svg';
import Delete from '../assets/delete.svg';
import Plus from '../assets/plus-circle-outline.svg'
import ArrowUp from '../assets/arrow-up-drop-circle-outline.svg'
import Calendar from '../assets/calendar-clock-outline.svg'
import Check from '../assets/check-circle-outline.svg'
import Menu from '../assets/menu-down.svg'
import { createPost } from './projectManager'

const setupBoard = (projects) => {
    let currentName = projects.get(0).title;
    let currentIndex = 0;
    const container = document.getElementById('container');
    const projectButton = createProjectButton();
    const projectManager = cE(['projectManager', 'hidden'], container);
    projectButton.decideTitle();
    populateProjects();
    const posts = cE(['posts'], container);
    populatePosts();

    function createProjectButton() {
        const div = document.createElement('div');
        const p = document.createElement('p');
        const menuIcon = addSvg(Menu, 'menuIcon')
        div.className = 'addProjectButton';
        div.appendChild(p);
        div.appendChild(menuIcon);
        div.addEventListener('click', toggleProjectManager);
        container.appendChild(div);
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


    }

    function readItem(e, index) {
        if (index === undefined) {
            currentIndex = this.dataset.index;
            currentName = this.dataset.name;
        } else {
            currentIndex = index;
            currentName = projects.get(index).title;
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
        if (equal(Object.values(projectButton.getData()), [name, index])) {
            currentIndex = (currentIndex - 1 < 0) ? 0 : currentIndex - 1
            currentName = projects.get(currentIndex).title;
        }
        projects.remove([index]);
        projectButton.decideTitle();
        this.parentElement.remove();
        logger(`Item deleted: ${name}`)
        populatePosts();
    }

    function addProject(parent, text = false, index = false, isProject = true) {
        const project = cE(parent, isProject ? [text] : false, 'project');
        project.dataset.name = text;
        project.dataset.index = index;
        if (isProject) {
            const remove = addSvg(Delete, 'Image', 'removeProjectButton');
            const edit = addSvg(Edit, 'Image', 'editProjectButton');
            project.appendChild(edit);
            project.appendChild(remove);
            remove.addEventListener('click', deleteItem, { once: true });
            edit.addEventListener('click', updateItem, { once: true });
            project.addEventListener('click', readItem, { once: true });
            const input = addInputBox(parent, { placeholder: 'New item' }, 'editProjectInput', 'hidden');
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    currentName = input.value;
                    projects.addProject(currentName);
                    currentIndex = projects.len() - 1;
                    logger(`Item created: ${currentName}`);
                    readItem(null, currentIndex);
                    projectButton.decideTitle();
                    addProject(projectManager, currentName, currentIndex)
                }
                if (e.key === 'Escape') {
                    input.classList.toggle('hidden');
                }
            });
        } else {
            project.appendChild(addSvg(Plus, 'Image', 'plus'));
            project.addEventListener('click', createItem, { once: true });
            project.classList.add('addProjectDiv');
        }
        parent.appendChild(input);
        parent.appendChild(project);
    }

    function readPost() {

    }

    function updatePost() {

    }

    function deletePost() {

    }

    function renderPost(parent, text = false, date = false, index = false, isPost = true) {
        const div = cE(['postContainer'], parent);
        const check = cE(['checkOut'], div);
        const checkIn = cE(['checkIn'], check);
        const post = cE(['post'], div, isPost ? [text, date] : false);
        div.dataset.name = text;
        div.dataset.index = index;
        if (isPost) {
            check.addEventListener('mouseover', () => checkIn.style.backgroundColor = "black");
            check.addEventListener('mouseout', () => checkIn.style.backgroundColor = "");
            function checked() {
                const [index, name] = getItemIndexName(this);
                projects.get(currentIndex).get(index).check();
                this.classList.toggle('hidden');
                checkIn.classList.toggle('checked');
                post.classList.toggle('checked');
            }
            check.addEventListener('click', checked.bind(post));
            const remove = addSvg(Delete, 'Image', 'removePostButton');
            const edit = addSvg(Edit, 'Image', 'editPostButton');
            post.appendChild(edit);
            post.appendChild(remove);
        } else {
            check.classList.add('hide');
            const plusIcon = addSvg(Plus, 'Image', 'plus')
            post.appendChild(plusIcon);
            post.classList.add('addPost');
            post.addEventListener('click', openCreatePost, { once: true });

            const form = document.createElement('form');
            form.classList.add('form', 'hidden');
            form.action = '#';
            form.method = 'get';
            post.appendChild(form);

            const fieldset = document.createElement('fieldset');
            fieldset.classList.add('fieldset');
            const title = addInputBox(fieldset, 'Title', true, ['input', 'title']);
            title.type = 'text';
            title.minlength = "1";
            title.required = true;
            title.title = 'A title is needed.';
            title.name = 'title';
            const date = cE(['date'], fieldset, ['No date']);
            const description = addInputBox(fieldset, 'Description', true, ['input', 'description'], 'textarea');
            description.name = 'description';
            const close = addSvg(ArrowUp, 'formButton', 'close', 'hidden');
            const calendar = addSvg(Calendar, 'formButton', 'calendar');
            const submitButton = document.createElement('button');
            submitButton.classList.add('formButton', 'submit', 'hidden')
            submitButton.type = 'submit';
            submitButton.onsubmit = 'return false'
            const checkIcon = addSvg(Check, 'formButton', 'ok');
            submitButton.appendChild(checkIcon);
            post.appendChild(close);
            date.appendChild(calendar);
            form.appendChild(fieldset);
            form.appendChild(submitButton);

            // function togglePostCreator(e) {
            //     if (clickedOnElement(e, 'close'))
            //     form.classList.toggle('hidden');
            //     close.classList.toggle('hidden');
            //     submitButton.classList.toggle('hidden');
            //     post.classList.toggle('selected');
            // }

            function closePost(e) {
                e.stopPropagation();
                logger('Edit form closed.')
                form.classList.add('hidden');
                close.classList.add('hidden');
                submitButton.classList.add('hidden');
                post.classList.remove('selected');
                plusIcon.style.display = 'flex';
                post.addEventListener('click', openCreatePost, { once: true }, true);
            };
            function openCreatePost(e) {
                e.stopPropagation();
                logger('Edit form opened.')
                form.classList.remove('hidden');
                close.classList.remove('hidden');
                submitButton.classList.remove('hidden');
                post.classList.add('selected');
                plusIcon.style.display = 'none';
                submitButton.addEventListener('click', addPost, { once: true }, true);
                close.addEventListener('click', closePost, { once: true }, true);
            }
            function addPost(e) {
                if (title.validity.valid) {
                    projects.get(currentIndex).add(createPost(title.value, '2023-03-09', description.value));
                    logger(`Post added: ${title.value}`);
                    populatePosts();
                } else {
                    close.addEventListener('click', closePost, { once: true }, true);
                }
            }
        }
    }

    function toggleProjectManager() {
        projectManager.classList.toggle('hidden');
        logger(`Project manager toggled ${projectManager.classList.contains('hidden') ? 'off' : 'on'}`);
    }

    function populateProjects() {
        for (let i = 0; i < projects.len(); i++) {
            const title = projects.get(i).title;
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
                renderPost(posts, data.title, data.date, i)
            }
            renderPost(posts, false, false, false, false)
            logger(`Render posts (${currentName})`)
        }
    }
}

const counter = (() => {
    let count = 0;
    const add = () => ++count;
    return { add }
})();

function logger(text) { return console.log(`${counter.add()}. ${text}`) }

function equal(a, b) { return a.reduce((p, c, i) => (c === b[i] && p), true) }

function addSvg(svg, ...className) {
    const element = document.createElement('div');
    const image = new Image();
    image.src = svg;
    element.appendChild(image);
    element.classList.add(...className);
    return element
}

function clickedOnElement(event, className) {
    const path = event.composedPath();
    for (let i = 0; i < path.length; i++) {
        if (path[i].classList && path[i].classList.contains(className)) {
            return true;
        }
    }
    return false
}

function cE(parent = false, textContent = false, ...className) {
    const element = document.createElement('div');
    if (className) { element.classList.add(...className) };
    if (textContent) {
        textContent.forEach((text) => {
            const p = document.createElement('p');
            p.textContent = text;
            element.appendChild(p);
        });
    }
    if (parent) { parent.appendChild(element) };
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

function addInputBox(parent, eventListener, args = { type: 'input', placeholder: false, focus: false }, ...className) {
    const input = document.createElement(args.type);
    input.addEventListener('keydown', eventListener);
    parent.appendChild(input);
    if (args.placeholder) {
        input.placeholder = args.placeholder;
    }
    if (args.focus) {
        input.focus();
    }
    if (className) {
        input.classList.add(...className);
    }
    return input
}



function renderProject(parent, text, index, projects) {
    const project = cE(parent, text, 'project');
    [project.dataset.name, project.dataset.index] = [text, index];
    const remove = addSvg(Delete, 'ProjectButton');
    const edit = addSvg(Edit, 'ProjectButton');
    remove.addEventListener('click', deleteItem, { once: true });
    edit.addEventListener('click', updateItem, { once: true });
    project.addEventListener('click', readItem, { once: true });
    const eventListener = e => {
        if (e.key === 'Enter') {
            projects.addProject(input.value);
        }
    }
    const input = addInputBox(parent, eventListener, { placeholder: 'New item' }, 'editProjectInput', 'hidden');
}

export { setupBoard }
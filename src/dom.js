// Fix so that its not possible to edit multiple project names simultaneously
// Make addProjectButton the boardTitle

import Edit from '../assets/pencil.svg';
import Delete from '../assets/delete.svg';
import Plus from '../assets/plus-circle-outline.svg'

function addSvg(svg, className) {
    const element = document.createElement('div');
    const image = new Image();
    image.src = svg;
    element.appendChild(image);
    element.className = 'Image';
    element.classList.add(className)
    return element
}

function cE(type, className, parent, textContent) {
    const element = document.createElement(type);
    if (className) {
        className.forEach(name => element.classList.add(name));
    }
    if (parent) {
        parent.appendChild(element)
    }
    if (textContent) {
        textContent.forEach((text) => {
            const p = document.createElement('p');
            p.textContent = text;
            element.appendChild(p);
        });
    }
    return element
};

function getProjectIndexName(element) {
    const index = [...element.parentElement.parentElement.children].indexOf(element.parentElement);
    const name = element.parentElement.dataset.name;
    return [index, name]
};

function clearElementChildren(element) {
    [...element.children].forEach((i => i.remove()));
};

function addInputBox(element, placeholder=false, focus = true) {
    const input = document.createElement('input');
    element.appendChild(input);
    if (placeholder){
        input.placeholder = placeholder;
    }
    if (focus) {
        input.focus();
    }
    return input
};

const setupBoard = (projects) => {
    const container = document.getElementById('container');
    const board = cE('div', ['board'], container);
    const posts = cE('div', ['posts'], board);
    const addProj = cE('div', ['addProjectButton'], board, [`${projects.name}+`]);
    const projectTitle = boardTitle();
    let projectManager = null;
    selectProject(null, 0);

    function selectProject(event, index) {
        if (index !== undefined) {
            projectTitle.rename(projects.list()[index], index)
        } else {
            projectTitle.rename(this.dataset.name, this.dataset.index);
            closeProjDrop();
        }
        populatePosts(index);
    };

    function boardTitle() {
        const div = document.createElement('div');
        div.className = 'projectTitle';
        const p = document.createElement('p');
        div.appendChild(p);
        board.appendChild(div);
        const rename = (name, index) => {
            // p get index to keep track of which project is currently selected
            p.textContent = name;
            p.dataset.index = index;
        };
        const getData = () => [p.textContent, parseInt(p.dataset.index)]
        return {
            rename,
            getData
        }
    };

    function removeProject(e) {
        const [index, name] = getProjectIndexName(this);
        e.stopPropagation();
        this.parentElement.remove();
        projects.removeProject([index]);
        if (projects.len() === 0) {
            projectTitle.rename(`Add a new ${projects.name}`, null)
        } else {
            // If the selected one is removed, update title
            if (projectTitle.getData().reduce((p, c, i) => (c == [name, index][i] && p), true)) {
                selectProject(null, (index - 1 < 0) ? 0 : index - 1);
            };
        }
    };

    function renameProject(e) {
        const [index, name] = getProjectIndexName(this);
        e.stopPropagation();
        const project = this.parentElement;
        clearElementChildren(project);
        const input = addInputBox(project, name);
        project.removeEventListener('click', selectProject);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                projects.renameProject(index, input.value);
                closeProjDrop();
                showProjectManager();
                selectProject(null, index);
            };
            if (e.key === 'Escape') {
                closeProjDrop();
                showProjectManager();
            };
        });
    }

    function nameProject() {
        clearElementChildren(this);
        const input = addInputBox(this);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                projects.addProject(input.value);
                closeProjDrop();
                showProjectManager();
                selectProject(null, projects.len() - 1);
            };
            if (e.key === 'Escape') {
                closeProjDrop();
                showProjectManager();
            };
        });
    };

    function addProject(parent, text, index, isProject = true) {
        const project = document.createElement('div');
        project.className = 'project';
        project.dataset.name = text;
        project.dataset.index = index;
        const name = document.createElement('p');
        name.textContent = text;
        if (isProject) {
            project.appendChild(name);
            const remove = addSvg(Delete, 'removeProjectButton')
            const edit = addSvg(Edit, 'editProjectButton')
            project.appendChild(remove);
            project.appendChild(edit);
            remove.addEventListener('click', removeProject, { once: true });
            edit.addEventListener('click', renameProject, { once: true });
            project.addEventListener('click', selectProject, { once: true });
        } else {
            project.appendChild(addSvg(Plus, 'plus'));
            // project.appendChild(name);
            project.addEventListener('click', nameProject, { once: true });
            project.classList.add('addProjectDiv');
        }
        parent.appendChild(project);
    };

    function showProjectManager() {
        if (projectManager == null) {
            projectManager = cE('div', ['projectManager'], board);
            // add all projects to the DOM
            for (let i = 0; i < projects.len(); i++) {
                const title = projects.get(i).getName();
                addProject(projectManager, title, i)
            }
            addProject(projectManager, `${projects.name}`, null, false);
        } else {
            closeProjDrop();
        }
    };

    function closeProjDrop() {
        projectManager.remove();
        projectManager = null;
    };

    function populatePosts(index) {
        const project = projects.get(index);
        for (let i = 0; i < project.len(); i++) {
            const data = project.get(i).get();
            cE('div', ['post'], posts, [data.title])
        }
    };
    // Binds
    addProj.addEventListener('click', showProjectManager);
};


export { setupBoard }
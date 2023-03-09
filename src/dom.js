import Edit from '../assets/pencil.svg';
import Delete from '../assets/delete.svg';

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

function addInputBox(element, focus = true, fun) {
    const input = document.createElement('input');
    element.appendChild(input);
    if (focus) {
        input.focus();
    }
    return input
};

const setupBoard = (projects) => {
    const container = document.getElementById('container');
    const board = cE('div', ['board'], container);
    const posts = cE('div', ['posts'], board);
    const addProj = cE('div', ['addProjectButton'], board, ['Projects +']);
    const projectTitle = boardTitle(projects.list()[0], 0);
    let projectManager = null;

    function selectProject(event, index) {
        if (index !== undefined) {
            projectTitle.rename(projects.list()[index], index)
        } else {
            projectTitle.rename(this.dataset.name, this.dataset.index);
            closeProjDrop();
        }
    };

    function boardTitle(name, index) {
        const div = document.createElement('div');
        div.className = 'projectTitle';
        const p = document.createElement('p');
        const rename = (name, index) => {
            p.textContent = name;
            p.dataset.index = index;
        };
        rename(name, index);
        div.appendChild(p);
        board.appendChild(div);
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
        if (projects.list().length == 0) {
            projectTitle.rename('Add a new project', null)
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
        const input = addInputBox(project);
        project.removeEventListener('click', selectProject);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                projects.renameProject(index, input.value);
                closeProjDrop();
                showProjDrop();
                selectProject(null, index);
            };
            if (e.key === 'Escape') {
                closeProjDrop();
                showProjDrop();
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
                showProjDrop();
                selectProject(null, projects.list().length - 1);
            };
            if (e.key === 'Escape') {
                closeProjDrop();
                showProjDrop();
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
        project.appendChild(name);
        if (isProject) {
            const remove = addSvg(Delete, 'removeProjectButton')
            const edit = addSvg(Edit, 'editProjectButton')
            project.appendChild(remove);
            project.appendChild(edit);
            remove.addEventListener('click', removeProject, { once: true });
            edit.addEventListener('click', renameProject, { once: true });
            project.addEventListener('click', selectProject, { once: true });
        } else {
            project.addEventListener('click', nameProject, { once: true });
        }
        parent.appendChild(project);
    };

    function showProjDrop() {
        if (projectManager == null) {
            projectManager = cE('div', ['projectManager'], board);
            // add all projects to the DOM
            for (let i = 0; i < projects.list().length; i++) {
                const title = projects.list()[i];
                addProject(projectManager, title, i)
            }
            addProject(projectManager, '+ New Project', null, false);
        } else {
            closeProjDrop();
        }
    };

    function closeProjDrop() {
        projectManager.remove();
        projectManager = null;
    };
    // Binds
    addProj.addEventListener('click', showProjDrop);
};


export { setupBoard }
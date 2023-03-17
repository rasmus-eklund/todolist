import Edit from '../assets/pencil.svg';
import Delete from '../assets/delete.svg';
import Plus from '../assets/plus-circle-outline.svg'
import ArrowUp from '../assets/arrow-up-drop-circle-outline.svg'
import Calendar from '../assets/calendar-clock-outline.svg'
import CheckCircle from '../assets/check-circle-outline.svg'
import Check from '../assets/check.svg'
import Menu from '../assets/menu-down.svg'

import { addSvg, clickedOnElement } from './helpers';
import { events } from './pubsub';

// FIX:
// possible to only edit one project at a time

const ProjectButton = (function () {
    const $container = document.getElementById('container');
    const $button = document.createElement('div');
    const $p = document.createElement('p');
    const $menuIcon = addSvg(Menu, 'image', 'menuImage');
    $button.appendChild($p);
    $button.appendChild($menuIcon);
    $button.className = 'addProjectButton';
    $container.appendChild($button);
    $button.addEventListener('click', () => events.emit('projectManagerToggled', null));
    events.on('projectSelected', setButtonTitle);
    function setButtonTitle(obj) {
        $p.textContent = obj.name;
        $p.dataset.index = obj.index;
    }
})();

const ProjectManager = (function () {
    //Dom
    const $container = document.getElementById('container');
    const $projectManager = document.createElement('div');
    $projectManager.classList.add('projectManager', 'hidden')
    $container.appendChild($projectManager);
    events.on('projectManagerToggled', toggle);
    events.on('getProjects', refreshProjects);

    function toggle() {
        $projectManager.classList.toggle('hidden');
    }

    function clearProjectManager() {
        while ($projectManager.firstChild) {
            $projectManager.firstChild.remove();
        }
    }

    function refreshProjects(projects) {
        clearProjectManager();
        let i = 0;
        for (i; i < projects.len(); i++) {
            const title = projects.get(i).getTitle();
            makeProjectElement(title, i);
        }
        makeAddProjectElement(i);
    }

    function makeProjectElement(text, index) {
        const $project = document.createElement('div');
        $project.classList.add('projectElement');
        $project.dataset.name = text;
        $project.dataset.index = index;
        const $title = document.createElement('p');
        $title.className = 'projectTitle';
        $title.textContent = text;
        const removeIcon = addSvg(Delete, 'image', 'ProjectButton', 'removeProjectImage');
        const editIcon = addSvg(Edit, 'image', 'ProjectButton', 'editProjectImage');
        const $input = document.createElement('input');
        $input.classList.add('editProjectInput', 'hidden');
        $input.placeholder = text;
        [$title, $input, editIcon, removeIcon].forEach((i) => $project.appendChild(i));

        $project.addEventListener('click', read);
        removeIcon.addEventListener('click', remove, { once: true });
        $project.addEventListener('click', e => handleProjectInput(e, updateProjectEventListener));
        $projectManager.appendChild($project);
    }

    function makeAddProjectElement(index) {
        const $project = document.createElement('div');
        $project.dataset.index = index;
        $project.classList.add('projectElement', 'addProjectElement');
        const plusIcon = addSvg(Plus, 'image', 'plusImage');
        const $input = document.createElement('input');
        $input.classList.add('editProjectInput', 'hidden');
        $input.placeholder = 'New item';
        $project.appendChild(plusIcon);
        $project.appendChild($input);
        $projectManager.appendChild($project);
        $project.addEventListener('click', e => handleProjectInput(e, createProjectEventListener));
    }

    function handleProjectInput(e, fun) {
        const target = clickedOnElement(e, ['editProjectImage', 'addProjectElement', 'plusImage'])
        if (target) {
            let nodes;
            if (target.classList.contains('editProjectImage')) {
                nodes = Array.from(target.parentElement.childNodes);
            } else {
                nodes = Array.from(target.childNodes);
            }
            for (const i in nodes) {
                if (nodes[i].classList.contains('editProjectInput')) {
                    const input = nodes[i];
                    input.classList.toggle('hidden');
                    input.focus();
                    input.addEventListener('keydown', fun);
                    break;
                }
            }
        }
    }

    function createProjectEventListener(e) {
        if (e.key === 'Enter' && this.value.length != 0) {
            create(this.value, this.parentElement.dataset.index);
            this.removeEventListener('keydown', createProjectEventListener);
        }
        if (e.key === 'Escape') {
            this.classList.toggle('hidden');
            this.removeEventListener('keydown', createProjectEventListener);
        }
    }
    function updateProjectEventListener(e) {
        if (e.key === 'Enter' && this.value.length != 0) {
            update(this.value, this.parentElement.dataset.index);
            this.removeEventListener('keydown', updateProjectEventListener);
        }
        if (e.key === 'Escape') {
            this.classList.toggle('hidden');
            this.removeEventListener('keydown', updateProjectEventListener);
        }
    }

    // CRUD Projects
    function create(name, index) {
        events.emit('createProject', name);
        events.emit('projectSelected', { name, index });
        events.emit('refreshProjects', null)
    }
    function read(e) {
        if (clickedOnElement(e, ['projectElement', 'projectTitle'])) {
            events.emit('projectSelected', { name: this.dataset.name, index: this.dataset.index });
            toggle();
        }
    }
    function update(newName, index) {
        events.emit('updateProject', { newName, index })
        events.emit('refreshProjects', null);
    }

    function remove() {
        events.emit('removeProject', this.parentElement.dataset.index);
        events.emit('refreshProjects', null);
    }
    return { refreshProjects }
})();

const PostManager = (function () {
    const $container = document.getElementById('container');
    const $postManager = document.createElement('div');
    $postManager.classList.add('postManager');
    $container.appendChild($postManager);
    let currentProject;

    events.on('getPosts', refreshPosts);
    events.on('currentProject', setCurrentProject);

    function setCurrentProject(obj) {
        currentProject = obj;
    }

    function clearPostManager() {
        while ($postManager.firstChild) {
            $postManager.firstChild.remove();
        }
    }

    function refreshPosts(posts) {
        clearPostManager();
        let i = 0;
        for (i; i < posts.len(); i++) {
            const data = posts.get(i).get();
            makePostElement(data.title, data.date, data.description, posts.get(i).isChecked(), i);
        }
        makeAddPostElement(i);
    }

    function makePostElement(title, date, description, checked, index) {
        const $postElement = document.createElement('div');
        $postElement.className = 'postElement';
        $postElement.dataset.name = title;
        $postElement.dataset.index = index;
        const $checkCircle = document.createElement('div');
        $checkCircle.classList.add('checkBox');
        checked ? $postElement.classList.add('checked') : null;
        const check = addSvg(Check, 'checkInsideCircle', 'hidden');
        $checkCircle.addEventListener('mouseover', () => check.classList.remove('hidden'));
        $checkCircle.addEventListener('mouseout', () => check.classList.add('hidden'));
        $checkCircle.addEventListener('click', postChecked);
        $checkCircle.appendChild(check);
        const $post = document.createElement('div');
        $post.className = 'post';
        const $postTitle = document.createElement('p');
        $postTitle.textContent = title;
        const $postDate = document.createElement('p');
        $postDate.textContent = date;
        const $postDescriptionDiv = document.createElement('div');
        $postDescriptionDiv.classList.add('descriptionDiv', 'hidden');
        const $postDescription = document.createElement('p');
        $postDescription.textContent = description;
        const remove = addSvg(Delete, 'image', 'postButtonImage', 'remove');
        const edit = addSvg(Edit, 'image', 'postButtonImage', 'edit');
        $postDescriptionDiv.appendChild($postDescription);
        [$postTitle, $postDate, edit, remove].forEach(i => $post.appendChild(i));
        $postElement.appendChild($checkCircle);
        $postElement.appendChild($post);
        $postElement.appendChild($postDescriptionDiv)
        $postManager.appendChild($postElement);
        remove.addEventListener('click', removePost, { once: true });
        $post.addEventListener('click', (e)=>$postDescriptionDiv.classList.toggle('hidden'));
    }

    function makeAddPostElement(index) {
        const $postElement = document.createElement('div');
        $postElement.classList.add('postElement');
        $postElement.dataset.index = index;

        const $post = document.createElement('div');
        $post.classList.add('postButton');

        const $form = document.createElement('form');
        $form.classList.add('form', 'hidden');
        $form.action = '#';
        $form.method = 'get';

        const $fieldset = document.createElement('fieldset');
        $fieldset.classList.add('fieldset');

        const $div = document.createElement('div');
        $div.classList.add('titleDate');

        const $title = document.createElement('input');
        $title.classList.add('input', 'title');
        $title.placeholder = 'Title';
        $title.type = 'text';
        $title.minlength = "1";
        $title.required = true;
        $title.title = 'A title is needed.';
        $title.name = 'title';

        const $date = document.createElement('div');
        $date.classList.add('date');

        const $dateText = document.createElement('p');
        $dateText.textContent = 'No date';

        const $dateInput = document.createElement('input');
        $dateInput.classList.add('input', 'dateInput', 'hidden');
        $dateInput.type = 'date';

        const $description = document.createElement('textarea');
        $description.classList.add('input', 'description');
        $description.name = 'description';
        $description.placeholder = 'Description';

        const close = addSvg(ArrowUp, 'image', 'close', 'closed');
        const calendar = addSvg(Calendar, 'formButton', 'calendar');
        const $submitButton = document.createElement('button');
        $submitButton.classList.add('formButton', 'submit')
        $submitButton.type = 'submit';
        $submitButton.onsubmit = 'return false'
        const checkIcon = addSvg(CheckCircle, 'formButton', 'ok');

        $postElement.addEventListener('click', (e) => {
            if (clickedOnElement(e, ['postButton', 'close'])) {
                $form.classList.toggle('hidden');
                close.classList.toggle('closed');
                $post.classList.toggle('open');
                if ($post.classList.contains('open')) {
                    $title.focus();
                }
            }
        });
        // $submitButton.addEventListener('click', createPost.bind($form), { once: true });
        // calendar.addEventListener('click', () => {
        //     $dateInput.classList.toggle('hidden');
        //     if($dateInput.classList.contains('hidden') && $dateInput.value){
        //         $dateText.textContent = '';
        //     }
        // })

        [$dateInput, $dateText, calendar].forEach(i => $date.appendChild(i));
        [$title, $date].forEach(i => $div.appendChild(i));
        [$div, $description].forEach(i => $fieldset.appendChild(i));
        $submitButton.appendChild(checkIcon);
        [$fieldset, $submitButton].forEach(i => $form.appendChild(i));
        $post.appendChild(close);
        $postElement.appendChild($post);
        $postElement.appendChild($form);
        $postManager.appendChild($postElement);
    }

    function postChecked() {
        events.emit('postChecked', [currentProject.index, this.parentElement.dataset.index]);
        this.parentElement.classList.toggle('checked');
    }

    // CRUD Posts
    function createPost(e) {
        e.preventDefault();
        if (this.checkValidity()) {
            let formData = {};
            for (let i = 0; i < this.length; i++) {
                if (this[i].name) {
                    formData[this[i].name] = this[i].value;
                    this[i].value = '';
                }
            }
            // events.emit('createPost', {})
            formData.date = '2023-03-15';
            events.emit('createPost', [currentProject.index, formData]);
            events.emit('projectSelected', currentProject);
        }
    }
    function removePost(e) {
        if (clickedOnElement(e, ['remove'])) {
            events.emit('removePost', [currentProject.index, parseInt(e.target.parentElement.parentElement.dataset.index)]);
            events.emit('projectSelected', currentProject);
        }
    }
})();

export { ProjectManager }
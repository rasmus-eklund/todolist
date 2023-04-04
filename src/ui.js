import Delete from '../assets/delete.svg';
import Plus from '../assets/plus-circle-outline.svg'
import ArrowDown from '../assets/arrow-down-drop-circle-outline.svg'
import CheckCircle from '../assets/check-circle-outline.svg'
import Check from '../assets/check.svg'
import Menu from '../assets/menu-down.svg'
import Sort from '../assets/sort.svg'

import { addSvg, clickedOnElement, dateToStr, sortByDate, sortByTitle } from './helpers';
import { events } from './pubsub';

const ProjectButton = (function () {
    const $container = document.getElementById('container');
    const $header = document.createElement('div');
    $header.id = 'header';
    const $button = document.createElement('div');
    const $p = document.createElement('p');
    const $menuIcon = addSvg(Menu, 'image', 'menuImage');
    $button.appendChild($p);
    $button.appendChild($menuIcon);
    $button.className = 'addProjectButton';
    $header.appendChild($button);
    $container.appendChild($header);
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
        const $titleDiv = document.createElement('div');
        const $title = document.createElement('p');
        $title.className = 'projectTitle';
        $title.textContent = text;
        const removeIcon = addSvg(Delete, 'image', 'removeProjectImage');
        const $input = document.createElement('input');
        $input.classList.add('editProjectInput', 'hidden');
        $input.placeholder = text;

        [$title, $input].forEach((i) => $titleDiv.appendChild(i));
        [$titleDiv, removeIcon].forEach((i) => $project.appendChild(i));
        $projectManager.appendChild($project);

        $project.addEventListener('click', read);
        removeIcon.addEventListener('click', remove, { once: true });
        $title.addEventListener('click', editProjectTitle);
        $input.addEventListener('blur', closeEditTitle);

        function editProjectTitle() {
            openEditTitle();
            $input.focus();
            $input.addEventListener('keydown', e => {
                if (e.key === 'Enter') update($input.value, index);
                if (e.key === 'Escape') closeEditTitle();
            })
        }
        function closeEditTitle() {
            $title.classList.remove('hidden');
            $input.classList.add('hidden');
        }
        function openEditTitle() {
            $title.classList.add('hidden');
            $input.classList.remove('hidden');
        }
        function update(newName, index) {
            $input.removeEventListener('blur', closeEditTitle);
            events.emit('updateProject', { newName, index })
            events.emit('refreshProjects', null);
        }
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
        $project.addEventListener('click', showAddProjectInput);
        $input.addEventListener('blur', closeAddProject);

        function showAddProjectInput(e) {
            if (clickedOnElement(e, ['addProjectElement', 'plusImage'])) {
                openAddProject();
                $input.focus();
                $input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') create($input.value, index);
                    if (e.key === 'Escape') closeAddProject();
                })
            }
        }

        function openAddProject() {
            plusIcon.classList.add('hidden');
            $input.classList.remove('hidden');
        }

        function closeAddProject() {
            plusIcon.classList.remove('hidden');
            $input.classList.add('hidden');
        }
    }

    // CRUD Projects
    function create(name, index) {
        events.emit('createProject', name);
        events.emit('projectSelected', { name, index });
        events.emit('refreshProjects', null)
    }
    function read(e) {
        if (clickedOnElement(e, ['projectElement'])) {
            events.emit('projectSelected', { name: this.dataset.name, index: this.dataset.index });
            toggle();
        }
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
    events.on('whatIsCurrentProjectIndex', () => events.emit('currentProjectIndexIs', currentProject));

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
            const date = data.date == "" ? "No date" : data.date;
            makePostElement(data.title, date, data.description, posts.get(i).isChecked(), i);
        }
        makeAddPostElement(i);
    }

    function makePostElement(title, date, description, checked, index) {
        const $postElement = document.createElement('div');
        $postElement.className = 'postElement';
        $postElement.dataset.name = title;
        const $checkCircle = document.createElement('div');
        $checkCircle.classList.add('checkBox');
        $checkCircle.dataset.index = index;
        checked ? $postElement.classList.add('checked') : null;
        const check = addSvg(Check, 'checkInsideCircle', 'hidden');

        $checkCircle.appendChild(check);
        const $post = document.createElement('div');
        $post.className = 'post';
        const $postTitleDiv = document.createElement('div');
        $postTitleDiv.classList.add('titleDiv');
        const $postTitle = document.createElement('p');
        $postTitle.className = 'postTitle';
        $postTitle.textContent = title;
        const $postTitleInput = document.createElement('input');
        $postTitleInput.placeholder = title;
        $postTitleInput.classList.add('postTitleInput', 'hidden');
        const $postDate = document.createElement('p');
        $postDate.className = 'postDate';
        $postDate.textContent = dateToStr(date);
        const $dateInput = document.createElement('input');
        $dateInput.classList.add('dateInput', 'hidden');
        $dateInput.type = 'date';
        const $postDescriptionDiv = document.createElement('div');
        $postDescriptionDiv.classList.add('postDescription', 'hidden');
        const $postDescription = document.createElement('p');
        $postDescription.textContent = description;
        const remove = addSvg(Delete, 'image', 'postButtonImage', 'remove');
        $postDescriptionDiv.appendChild($postDescription);
        $postTitleDiv.appendChild($postTitle);
        $postTitleDiv.appendChild($postTitleInput);
        const $postContainer = document.createElement('div');
        $postContainer.className = 'postContainer';
        [$postTitleDiv, $postDate, $dateInput, remove].forEach(i => $post.appendChild(i));
        $postContainer.appendChild($post);
        $postContainer.appendChild($postDescriptionDiv);
        $postElement.appendChild($checkCircle);
        $postElement.appendChild($postContainer);
        $postManager.appendChild($postElement);

        // Binds
        remove.addEventListener('click', (e) => {
            if (clickedOnElement(e, ['remove'])) {
                events.emit('removePost', [currentProject.index, index]);
                events.emit('projectSelected', currentProject);
            }
        }, { once: true });

        $post.addEventListener('click', (e) => {
            if (clickedOnElement(e, ['post', 'titleDiv'])) {
                $postDescriptionDiv.classList.toggle('hidden');
            }
        });
        // Edit post title
        $postTitle.addEventListener('click', (e) => {
            if (clickedOnElement(e, ['postTitle'])) {
                $postTitle.classList.toggle('hidden');
                $postTitleInput.classList.toggle('hidden');
                $postTitleInput.focus();
                $postTitleInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && $postTitleInput.value.length != 0) {
                        editPost(index, $postTitleInput.value, false, false);
                        $postTitle.classList.toggle('hidden');
                        $postTitleInput.classList.toggle('hidden');
                    }
                    if (e.key === 'Escape') {
                        $postTitle.classList.toggle('hidden');
                        $postTitleInput.classList.toggle('hidden');
                    }
                })
                $postTitleInput.addEventListener('blur', () => {
                    $postTitle.classList.remove('hidden');
                    $postTitleInput.classList.add('hidden');
                }, { once: true })
            }
        })
        // Edit post date
        $postDate.addEventListener('click', (e) => {
            if (clickedOnElement(e, ['postDate'])) {
                $postDate.classList.toggle('hidden');
                $dateInput.classList.toggle('hidden');
                if ($postDate.textContent !== "No date") {
                    $dateInput.value = $postDate.textContent;
                }
                $dateInput.focus();
                $dateInput.addEventListener('blur', blurDate);
                $dateInput.addEventListener('change', updateDate);
            }
        })

        $checkCircle.addEventListener('mouseover', () => check.classList.remove('hidden'));
        $checkCircle.addEventListener('mouseout', () => check.classList.add('hidden'));
        $checkCircle.addEventListener('click', postChecked);

        function updateDate() {
            $dateInput.removeEventListener('blur', blurDate);
            editPost(index, false, $dateInput.value ? $dateInput.value : 'No date', false)
            $postDate.classList.toggle('hidden');
            $dateInput.classList.toggle('hidden');
        }
        function editPost(index, name, date, description) {
            events.emit('editPostTitle', [currentProject.index, index, name, date, description]);
            events.emit('projectSelected', currentProject);
        }

        function blurDate() {
            updateDate()
            $dateInput.removeEventListener('change', updateDate);
            $postDate.classList.remove('hidden');
            $dateInput.classList.add('hidden');
        }

        function postChecked() {
            events.emit('postChecked', [currentProject.index, index]);
            this.parentElement.classList.toggle('checked');
        }
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
        $dateText.className = 'dateText'
        $dateText.textContent = 'No date';

        const $dateInput = document.createElement('input');
        $dateInput.classList.add('input', 'dateInput', 'hidden');
        $dateInput.type = 'date';
        $dateInput.name = 'date';

        const $description = document.createElement('textarea');
        $description.classList.add('input', 'description');
        $description.name = 'description';
        $description.placeholder = 'Description';

        const close = addSvg(ArrowDown, 'image', 'close');
        const $submitButton = document.createElement('button');
        $submitButton.classList.add('formButton', 'submit')
        $submitButton.type = 'submit';
        $submitButton.onsubmit = 'return false'
        const checkIcon = addSvg(CheckCircle, 'formButton', 'ok');

        [$dateInput, $dateText].forEach(i => $date.appendChild(i));
        [$title, $date].forEach(i => $div.appendChild(i));
        [$div, $description].forEach(i => $fieldset.appendChild(i));
        $submitButton.appendChild(checkIcon);
        [$fieldset, $submitButton].forEach(i => $form.appendChild(i));
        $post.appendChild(close);
        $postElement.appendChild($post);
        $postElement.appendChild($form);
        $postManager.appendChild($postElement);

        // Add binds

        // Show add post window
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
        $submitButton.addEventListener('click', createPost.bind($form), { once: true });

        // Chose date
        $dateText.addEventListener('click', (e) => {
            if (clickedOnElement(e, ['dateText'])) {
                $dateInput.classList.toggle('hidden');
                $dateText.classList.toggle('hidden');
                if ($dateText.textContent !== "No date") {
                    $dateInput.value = $dateText.textContent;
                }
                $dateInput.focus();
                $dateInput.addEventListener('blur', blurDate);
                $dateInput.addEventListener('change', setDate);
            }
        })

        function setDate() {
            if ($dateInput.value) {
                $dateText.textContent = $dateInput.value;
            } else {
                $dateText.textContent = "No date";
            }
            $dateInput.classList.add('hidden');
            $dateText.classList.remove('hidden');
            $dateInput.removeEventListener('blur', blurDate);
        }

        function blurDate() {
            if ($dateInput.value) {
                $dateText.textContent = $dateInput.value;
            } else {
                $dateText.textContent = "No date";
            }
            $dateInput.classList.add('hidden');
            $dateText.classList.remove('hidden');
        }

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
                events.emit('createPost', [currentProject.index, formData]);
                events.emit('projectSelected', currentProject);
            }
        }
    }
})();

const SortButton = (function () {
    let currentProject;
    events.on('currentProjectIndexIs', i => currentProject = i);
    const $header = document.getElementById('header');
    const $sort = document.createElement('div');
    $sort.classList.add('Sort');
    const $sortIcon = addSvg(Sort, 'image', 'SortIcon');

    const $sortDrop = document.createElement('div');
    $sortDrop.classList.add('sortDrop', 'hidden');
    const $sortList = document.createElement('ul');
    ['Date ascending', 'Date descending', 'Title ascending', 'Title descending'].forEach(i => {
        const item = document.createElement('li');
        item.classList.add('listItem');
        item.textContent = i;
        $sortList.appendChild(item);
        item.addEventListener('click', () => sortBy(i));
    });
    $sort.appendChild($sortIcon);
    $sortDrop.appendChild($sortList);
    $sort.appendChild($sortDrop);
    $header.appendChild($sort);

    // Binds
    $sort.addEventListener('click', e => {
        if (clickedOnElement(e, ['SortIcon'])) {
            $sortDrop.classList.toggle('hidden');
        }
    })
    function sortBy(i){
        events.emit('whatIsCurrentProjectIndex', null);
        const id = currentProject.index;
        if (i == 'Date ascending') events.emit('sortBy', { fn: sortByDate(), id: id });
        if (i == 'Date descending') events.emit('sortBy', { fn: sortByDate(false), id: id });
        if (i == 'Title ascending') events.emit('sortBy', { fn: sortByTitle(), id: id });
        if (i == 'Title descending') events.emit('sortBy', { fn: sortByTitle(false), id: id });
        $sortDrop.classList.toggle('hidden');
        events.emit('projectSelected', currentProject);
    }
})();

export { ProjectManager }
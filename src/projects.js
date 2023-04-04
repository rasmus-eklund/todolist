import { strToDate } from './helpers';

const createPost = function (title, date, description) {
    const post = { title, date: strToDate(date), description, priority: null, checked: 0 };
    const get = () => post;
    const set = (title = false, date = false, description = false) => {
        title ? post.title = title : null;
        date ? post.date = strToDate(date) : null;
        description ? post.description = description : null;
    }
    const check = () => {
        post.checked = post.checked ? false : true;
    }
    const isChecked = () => post.checked;
    return { get, set, check, isChecked }
}

const createContainer = () => {
    let container = [];
    const add = obj => container.push(obj);
    const remove = index => container.splice(index, 1);
    const get = index => container[index];
    const len = () => container.length;
    const sortBy = (fn) => container.sort(fn);
    return { add, remove, get, len, sortBy }
}

const createProject = (title) => {
    let project = Object.assign(createContainer());
    title = title;
    project.getTitle = () => title;
    project.addPost = (title, date, description) => project.add(createPost(title, date, description));
    project.rename = newName => title = newName;
    project.editPost = (index, title, date, description) => project.get(index).set(title, date, description);
    return project;
}

const Container = () => {
    let container = Object.assign(createContainer());
    container.addProject = title => container.add(createProject(title));
    container.renameProject = (index, newName) => container.get(index).rename(newName);
    return container;
};

export { Container }
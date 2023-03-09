
const createPost = function (title, date, description) {
    const post = { title, date, description, priority: null, checked: 0 };
    const get = () => [post.title, post.date, post.description];
    const set = (title = false, date = false, description = false) => {
        title ? post.title = title : null;
        date ? post.date = date : null;
        description ? post.description = description : null;
    }
    const checked = () => {
        post.checked = post.checked ? false : true;
    }
    return { get, set }
}

const createContainer = () => {
    const container = [];
    const add = obj => container.push(obj);
    const remove = index => index.sort((a, b) => b - a).forEach(i => container.splice(i, 1));
    const list = () => container.map((i) => i.getName())
    const get = index => container[index]
    return { add, remove, list, get }
}

const createProject = (title) => {
    let project = Object.assign(createContainer());
    project.title = title;
    const rename = newName => project.title = newName;
    const getName = () => project.title;
    const addPost = (title, date, description) => project.add(createPost(title, date, description));
    const editPost = (index, title, date, description) => project.get(index).set(title, date, description);
    return { rename, getName, addPost, editPost };
}

export const Container = () => {
    let container = Object.assign(createContainer());
    container.addProject = (title) => container.add(createProject(title));
    container.removeProject = (indices) => container.remove(indices);
    container.renameProject = (index, newName) => container.get(index).rename(newName);
    return container;
};
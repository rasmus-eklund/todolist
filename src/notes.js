
const addItem = { add(obj) { this.container.push(obj) } }

const removeItem = { remove(ix) { ix.sort((a, b) => b - a).forEach(i => this.container.splice(i, 1)) } }

const listItems = { listItems() { return this.container.map((i) => i.title) } }

const createPost = function (title, date, description) { return { title, date, description, priority: null, checked: 0 } }

const createContainer = () => Object.assign({ container: [] },
    addItem,
    removeItem,
    listItems);

const createProject = (title, description) => {
    let obj = { container: [], title, description };
    obj = Object.assign(obj, addItem, removeItem, listItems);
    return obj
}

const manager = (function () {
    let container = createContainer();
    function addProject(title, description) {
        container.add(createProject(title, description));
    }
    function removeProject(indices) {
        container.remove(indices);
    }
    function addPost(index, title, date, description) {
        container.container[index].add(createPost(title, date, description));
    }
    function removePost(projectIndex, postIndex) {
        container.container[index].remove(postIndex);
    }
    function listProjects() {
        return container.listItems();
    }
    return {
        addProject,
        removeProject,
        addPost,
        removePost,
        listProjects
    }
})();

export { manager }
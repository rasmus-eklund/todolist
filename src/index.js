import './style.css'
import { Container } from './projectManager'
import { events } from "./pubsub";
import { ProjectManager } from './dom2';

(function () {
    const container = Container();
    container.addProject('Default');
    container.get(0).addPost('Do A', '2023-03-09', 'Description');
    container.get(0).addPost('Do B', '', 'Description');
    container.get(0).addPost('Do C', '2023-03-08', 'Description');
    container.get(0).addPost('Do D', '2023-03-10', 'Description');
    container.addProject('Test');
    container.get(1).addPost('Test 1', '2023-03-11', 'Some stuff');

    events.on('createProject', name => {
        container.addProject(name);
        events.emit('projectSelected', { name: name, index: container.len() - 1 });
    });
    events.on('removeProject', (i) => {
        container.remove(i);
        if (container.len() === 0) {
            events.emit('projectSelected', { name: 'Empty', index: null });
        } else {
            events.emit('projectSelected', { name: container.get(0).getTitle(), index: 0 });
        }
    });
    events.on('refreshProjects', () => events.emit('getProjects', container));
    ProjectManager.refreshProjects(container);
    events.on('updateProject', (obj) => {
        const [name, index] = [obj.newName, obj.index];
        container.renameProject(index, name);
        events.emit('projectSelected', { index, name });
    });
    events.on('projectSelected', obj => {
        events.emit('currentProject', obj);
        events.emit('getPosts', container.get(obj.index));
    });
    events.on('postChecked', d => container.get(d[0]).get(d[1]).check());
    events.on('createPost', d => container.get(d[0]).addPost(d[1].title, d[1].date, d[1].description));
    events.on('removePost', d => container.get(d[0]).remove(d[1]));
    events.on('editPostTitle', d => container.get(d[0]).editPost(d[1], d[2], d[3], d[4]));
    events.emit('projectSelected', { index: 0, name: container.get(0).getTitle() });
})();

import './style.css'
import { Container } from './projectManager'
import { events } from "./pubsub";
import { ProjectManager } from './dom2';
import { format, compareAsc } from 'date-fns';

console.log(format(new Date(2014, 1, 11), 'yyyy-MM-dd'));

(function () {
    const container = Container();
    container.addProject('Default');
    container.get(0).addPost('Do A', '2023-03-09', 'Description');
    container.get(0).addPost('Do B', '2023-03-09', 'Description');
    container.addProject('Test');
    container.get(0).addPost('Do C', '2023-03-09', 'Description');
    container.get(0).addPost('Do D', '2023-03-09', 'Description');

    events.on('createProject', name => {
        container.addProject(name);
        events.emit('projectSelected', { name: name, index: container.len() });
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
    events.emit('projectSelected', { index: 0, name: container.get(0).getTitle() });
})();

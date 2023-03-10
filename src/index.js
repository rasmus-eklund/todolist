import { Container, createPost } from './projectManager'
import { setupBoard } from './dom'
import './style.css'

const obj = Container();
obj.addProject('Default');
obj.get(0).add(createPost('Do A', '2023-03-09', 'Description'));
obj.get(0).add(createPost('Do B', '2023-03-09', 'Description'));
setupBoard(obj);
import { Container } from './projectManager'
import { setupBoard } from './dom'
import './style.css'

const obj = Container();
obj.addProject('Default');
setupBoard(obj);
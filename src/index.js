import { manager } from './notes'
import { DOM } from './dom'
import './style.css'

const dom = DOM();
dom.bind_addProj(function(){
    manager.addProject('a', 'b');
    manager.addProject('b', 'd')
    console.log(manager.listProjects());
})
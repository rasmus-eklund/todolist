
function onclickContainer() {
    if (projectManagerOpen && inputOpen) {
        projectManagerOpen = true;
        inputOpen = false;
    } else if (projectManagerOpen) {
        inputOpen = false;
    }
    onclickRemove();
    openProjectManager.decideTitle()
    populatePosts();
}
function onclickProjectManager(e) {
    e.stopPropagation();
    if (inputOpen) {
        inputOpen = false;
        projectManagerOpen = true;
    }
    onclickRemove();
}

function onclickInput(e) {
    e.stopPropagation();
    if (inputOpen) {
        inputOpen = false;
        onclickRemove();
    }
    this.addInputBox();
}

function onclickRemove() {
    if (!projectManagerOpen) {
        if (projectManager !== undefined) {
            projectManager.remove();
            projectManager.removeEventListener('click', onclickProjectManager);
        }
    }
    if (!inputOpen) {
        if (input !== undefined) {
            input.remove();
            input.removeEventListener('click', onclickInput);
        }
    }
}

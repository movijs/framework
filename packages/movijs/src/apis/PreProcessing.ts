const preprocessitem = new Set<Function>();

export function PreProcessing(callback: () => any) {
    preprocessitem.add(callback);
    renderPreProcessing();
}

export function renderPreProcessing() {
    preprocessitem.forEach(i => {
        i();
    })
}
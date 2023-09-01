class GlobalEvents {
    private notify = new Map();
    public addHandler(event: string, calback: () => any) {
        this.notify.set(calback, event);
    }
    public removeHandler(event: string, calback: () => any) {
        this.notify.delete(calback);
    }

    public dispatch(event: string) {
       
        this.notify.forEach((x, y) => { 
            if (x === event) {
                y()
            }
        });
    } 
}
const ge = new GlobalEvents();
export default ge; 
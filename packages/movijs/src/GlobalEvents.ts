class GlobalEvents {
    private notify = new Map<Function, any>();
    public addHandler(event: string, calback: Function): Function {
        this.notify.set(calback, event);
        return calback;
    }
    public removeHandler(calback: () => any) {
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
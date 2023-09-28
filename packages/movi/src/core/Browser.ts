import { ApplicationService } from "movijs";
import { Disposable, markAsSingleton } from "./lifecycle";
import { Emitter, Event } from "./Event";
const userAgent = navigator.userAgent;
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (!isChrome && (userAgent.indexOf('Safari') >= 0));
export const isWebkitWebView = (!isChrome && !isSafari && isWebKit);
export const isElectron = (userAgent.indexOf('Electron/') >= 0);
export const isAndroid = (userAgent.indexOf('Android') >= 0);

class WindowManager {

    constructor() {
        if (window) {

            if ((window['fullScreen']) ||  (window.innerHeight == screen.height)) {
                this.setFullscreen(true);
            } else {
                this.setFullscreen(false);
            } 
            window.addEventListener('resize', () => { 
                if ((window['fullScreen']) ||  (window.innerHeight == screen.height)) {
                    this.setFullscreen(true);
                } else {
                    this.setFullscreen(false);
                }

            })
        } 
    }
    public static readonly INSTANCE = new WindowManager();

    // --- Zoom Level
    private _zoomLevel: number = 0;

    public getZoomLevel(): number {
        return this._zoomLevel;
    }
    public setZoomLevel(zoomLevel: number): void {
        if (this._zoomLevel === zoomLevel) {
            return;
        }
        this._zoomLevel = zoomLevel;
    }

    // --- Zoom Factor
    private _zoomFactor: number = 1;

    public getZoomFactor(): number {
        return this._zoomFactor;
    }
    public setZoomFactor(zoomFactor: number): void {
        this._zoomFactor = zoomFactor;
    }

    // --- Fullscreen
    private _fullscreen: boolean = false;
    private readonly _onDidChangeFullscreen = new Emitter<boolean>();

    public readonly onDidChangeFullscreen: Event<boolean> = this._onDidChangeFullscreen.event;
    public setFullscreen(fullscreen: boolean): void {
        if (this._fullscreen === fullscreen) {
            return;
        }

        this._fullscreen = fullscreen; 
        this._onDidChangeFullscreen.fire(this._fullscreen);
    }
    public isFullscreen(): boolean {
        return this._fullscreen;
    }
}


class DevicePixelRatioMonitor extends Disposable {

    private readonly _onDidChange = this._register(new Emitter<void>());
    public readonly onDidChange = this._onDidChange.event;

    private readonly _listener: () => void;
    private _mediaQueryList: MediaQueryList | null;

    constructor() {
        super();

        this._listener = () => this._handleChange(true);
        this._mediaQueryList = null;
        this._handleChange(false);
    }

    private _handleChange(fireEvent: boolean): void {
        this._mediaQueryList?.removeEventListener('change', this._listener);

        this._mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        this._mediaQueryList.addEventListener('change', this._listener);

        if (fireEvent) {
            this._onDidChange.fire();
        }
    }
}

class PixelRatioImpl extends Disposable {

    private readonly _onDidChange = this._register(new Emitter<number>());
    public readonly onDidChange = this._onDidChange.event;

    private _value: number;

    public get value(): number {
        return this._value;
    }

    constructor() {
        super();

        this._value = this._getPixelRatio();

        const dprMonitor = this._register(new DevicePixelRatioMonitor());
        this._register(dprMonitor.onDidChange(() => {
            this._value = this._getPixelRatio();
            this._onDidChange.fire(this._value);
        }));
    }

    private _getPixelRatio(): number {
        const ctx: any = document.createElement('canvas').getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    }
}


class PixelRatioFacade {

    private _pixelRatioMonitor: PixelRatioImpl | null = null;
    private _getOrCreatePixelRatioMonitor(): PixelRatioImpl {
        if (!this._pixelRatioMonitor) {
            this._pixelRatioMonitor = markAsSingleton(new PixelRatioImpl());
        }
        return this._pixelRatioMonitor;
    }

    public get value(): number {
        return this._getOrCreatePixelRatioMonitor().value;
    }

    public get onDidChange(): Event<number> {
        return this._getOrCreatePixelRatioMonitor().onDidChange;
    }
}


export function addMatchMediaChangeListener(query: string | MediaQueryList, callback: (this: MediaQueryList, ev: MediaQueryListEvent) => any): void {
    if (typeof query === 'string') {
        query = window.matchMedia(query);
    }
    query.addEventListener('change', callback);
}


export const PixelRatio = new PixelRatioFacade();

export function setZoomLevel(zoomLevel: number): void {
    WindowManager.INSTANCE.setZoomLevel(zoomLevel);
}
export function getZoomLevel(): number {
    return WindowManager.INSTANCE.getZoomLevel();
}

export function getZoomFactor(): number {
    return WindowManager.INSTANCE.getZoomFactor();
}
export function setZoomFactor(zoomFactor: number): void {
    WindowManager.INSTANCE.setZoomFactor(zoomFactor);
}

export function setFullscreen(fullscreen: boolean): void {
    WindowManager.INSTANCE.setFullscreen(fullscreen);
}
export function isFullscreen(): boolean {
    return WindowManager.INSTANCE.isFullscreen();
}
export const onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;

let standalone = false;
if (window.matchMedia) {
    const standaloneMatchMedia = window.matchMedia('(display-mode: standalone) or (display-mode: window-controls-overlay)');
    const fullScreenMatchMedia = window.matchMedia('(display-mode: fullscreen)');
    standalone = standaloneMatchMedia.matches;
    addMatchMediaChangeListener(standaloneMatchMedia, ({ matches }) => {
        if (standalone && fullScreenMatchMedia.matches) {
            return;
        }
        standalone = matches;
    });
}

export function isStandalone(): boolean {
    return standalone;
}

export function isWCOEnabled(): boolean {
    return (navigator as any)?.windowControlsOverlay?.visible;
}
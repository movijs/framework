export const LANGUAGE_DEFAULT:String = 'en';

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isElectron = false;
let _isIOS = false;
let _isCI = false;
let _isMobile = false;
let _locale: String | undefined = undefined;
let _language: String = LANGUAGE_DEFAULT;
let _platformLocale: String = LANGUAGE_DEFAULT;
let _translationsConfigFile: String | undefined = undefined;
let _userAgent: String | undefined = undefined;



interface NLSConfig {
	locale: String;
	osLocale: String;
	availableLanguages: { [key: string]:string };
	_translationsConfigFile: String;
}

export interface IProcessEnvironment {
	[key: string]: string | undefined;
}


export interface INodeProcess {
	platform: string;
	arch: string;
	env: IProcessEnvironment;
	versions?: {
		electron?: string;
		chrome?: string;
	};
	type?: string;
	cwd: () => string;
}

declare const process: INodeProcess;
declare const global: unknown;
declare const self: unknown;


export const globals: any = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});

let nodeProcess: INodeProcess | undefined = undefined;
if (typeof globals.movijs !== 'undefined' && typeof globals.movijs.process !== 'undefined') { 
	nodeProcess = globals.movijs.process;
} else if (typeof process !== 'undefined') { 
	nodeProcess = process;
}

const isElectronProcess = typeof nodeProcess?.versions?.electron === 'string';
const isElectronRenderer = isElectronProcess && nodeProcess?.type === 'renderer';

interface INavigator {
	userAgent: string;
	maxTouchPoints?: number;
	language: string;
}
declare const navigator: INavigator;



if (typeof navigator === 'object' && !isElectronRenderer) {
	_userAgent = navigator.userAgent;
	_isWindows = _userAgent.indexOf('Windows') >= 0;
	_isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
	_isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
	_isLinux = _userAgent.indexOf('Linux') >= 0;
	_isMobile = _userAgent?.indexOf('Mobi') >= 0;
	_isWeb = true; 
	if(_locale) _language = _locale;
	_platformLocale = navigator.language;
}


else if (typeof nodeProcess === 'object') {
	_isWindows = (nodeProcess.platform === 'win32');
	_isMacintosh = (nodeProcess.platform === 'darwin');
	_isLinux = (nodeProcess.platform === 'linux');
	_isLinuxSnap = _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
	_isElectron = isElectronProcess;
	_isCI = !!nodeProcess.env['CI'] || !!nodeProcess.env['BUILD_ARTIFACTSTAGINGDIRECTORY'];
	_locale = LANGUAGE_DEFAULT;
	_language = LANGUAGE_DEFAULT;
	const rawNlsConfig = nodeProcess.env['MOVIJS_NLS_CONFIG'];
	if (rawNlsConfig) {
		try {
			const nlsConfig: NLSConfig = JSON.parse(rawNlsConfig);
			const resolved = nlsConfig.availableLanguages['*'];
			_locale = nlsConfig.locale;
			_platformLocale = nlsConfig.osLocale; 
			_language = resolved ? resolved : LANGUAGE_DEFAULT;
			_translationsConfigFile = nlsConfig._translationsConfigFile;
		} catch (e) {
		}
	}
	_isNative = true;
}
else {
	console.error('Unable to resolve platform.');
}


export const enum OperatingSystem {
	Windows = 1,
	Macintosh = 2,
	Linux = 3
}
export const OS = (_isMacintosh || _isIOS ? OperatingSystem.Macintosh : (_isWindows ? OperatingSystem.Windows : OperatingSystem.Linux));

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;
export const isLinuxSnap = _isLinuxSnap;
export const isNative = _isNative;
export const isElectron = _isElectron;
export const isWeb = _isWeb;
export const isWebWorker = (_isWeb && typeof globals.importScripts === 'function');
export const isIOS = _isIOS;
export const isMobile = _isMobile;
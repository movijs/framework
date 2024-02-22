export * from "./IConfigurationOptions"
export * from "./IServiceManager"
export * from "./IMoviApp"
export * from "./IControl"
export * from "./IAttribute"
export * as arrayExtensions from "./Collections"

export const ComponentDefaults = new Set<string>();
ComponentDefaults.add('model');
ComponentDefaults.add('setup');
ComponentDefaults.add('activated');
ComponentDefaults.add('activating');
ComponentDefaults.add('routeChanged');
ComponentDefaults.add('onRouteChanged');
ComponentDefaults.add('interrupt');
ComponentDefaults.add('intervention');
ComponentDefaults.add('onconfig');
ComponentDefaults.add('preconfig');
ComponentDefaults.add('oncreating');
ComponentDefaults.add('oncreated');
ComponentDefaults.add('onbuilding');
ComponentDefaults.add('onbuilded');
ComponentDefaults.add('ondisposing');
ComponentDefaults.add('ondisposed');
ComponentDefaults.add('view');
ComponentDefaults.add('reload');
ComponentDefaults.add('using');
ComponentDefaults.add('context');
ComponentDefaults.add('slots');
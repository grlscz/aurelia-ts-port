declare module 'aurelia-logging-console/index' {
	import { ILogger, IAppender } from 'aurelia-logging';
	export class ConsoleAppender implements IAppender {
	    constructor();
	    debug(logger: ILogger, message: string, ...rest: any[]): void;
	    info(logger: ILogger, message: string, ...rest: any[]): void;
	    warn(logger: ILogger, message: string, ...rest: any[]): void;
	    error(logger: ILogger, message: string, ...rest: any[]): void;
	}

}
declare module 'aurelia-logging-console' {
	export * from 'aurelia-logging-console/index';
}

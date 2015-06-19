export const enum LogLevel {
    none = 0,
    error = 1,
    warn = 2,
    info = 3,
    debug = 4
}

export interface ILoggerMedthod {
    (message: string, ...rest): void;
}

export interface ILogger {
    id: string;
    debug: ILoggerMedthod;
    info: ILoggerMedthod;
    warn: ILoggerMedthod;
    error: ILoggerMedthod;
}

export interface IAppenderMedthod {
    (logger: ILogger, message: string, ...rest): void;
}

export interface IAppender {
    debug: IAppenderMedthod;
    info: IAppenderMedthod;
    warn: IAppenderMedthod;
    error: IAppenderMedthod;
}

export interface IError extends Error {
    innerError?: Error;
    stack?: string;
}
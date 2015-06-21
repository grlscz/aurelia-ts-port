export interface IBrowserHistoryOptions {
    root?: string;
    hashChange?: boolean;
    pushState?: boolean;
    silent?: boolean;
    routeHandler?: (fragment: string) => boolean;
}

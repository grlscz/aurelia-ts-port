export interface INavigateOptions {
    replace?: boolean;
    trigger?: boolean;
}

export interface IHistory {
    activate(options?): boolean;
    deactivate(): void;
    navigate(): boolean;
    navigate(fragment: string, options?: boolean | INavigateOptions): boolean;
    navigateBack(): void;
}
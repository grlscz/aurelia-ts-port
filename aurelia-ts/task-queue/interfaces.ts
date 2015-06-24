export interface ITask {
    call(): void;
    onError?(error: Error): void;
}

declare module 'aurelia-task-queue/interfaces' {
	export interface ITask {
	    call(): void;
	    onError?(error: Error): void;
	}

}
declare module 'aurelia-task-queue/index' {
	import { ITask } from 'aurelia-task-queue/interfaces';
	export { ITask } from 'aurelia-task-queue/interfaces';
	export class TaskQueue {
	    microTaskQueue: ITask[];
	    microTaskQueueCapacity: number;
	    taskQueue: ITask[];
	    requestFlushMicroTaskQueue: () => void;
	    requestFlushTaskQueue: () => void;
	    constructor();
	    queueMicroTask(task: ITask): void;
	    queueTask(task: ITask): void;
	    flushTaskQueue(): void;
	    flushMicroTaskQueue(): void;
	    onError(error: Error, task: ITask): void;
	}

}
declare module 'aurelia-task-queue' {
	export * from 'aurelia-task-queue/index';
}

import {IHistory} from './interfaces';
export {IHistory, INavigateOptions} from './interfaces';

export class History implements IHistory {
    activate(): boolean {
        throw new Error('History must implement activate().');
    }

    deactivate(): void {
        throw new Error('History must implement deactivate().');
    }

    navigate(): boolean {
        throw new Error('History must implement navigate().');
    }

    navigateBack(): void {
        throw new Error('History must implement navigateBack().');
    }
}

import {Dictionary} from 'aurelia-tsutil';
import {ISegment, ICharacterSpecification} from './interfaces';

const specials = [
    '/', '.', '*', '+', '?', '|',
    '(', ')', '[', ']', '{', '}', '\\'
];

const escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

// A Segment represents a segment in the original route description.
// Each Segment type provides an `eachChar` and `regex` method.
//
// The `eachChar` method invokes the callback with one or more character
// specifications. A character specification consumes one or more input
// characters.
//
// The `regex` method returns a regex fragment for the segment. If the
// segment is a dynamic or star segment, the regex fragment also includes
// a capture.
//
// A character specification contains:
//
// * `validChars`: a String with a list of all valid characters, or
// * `invalidChars`: a String with a list of all invalid characters
// * `repeat`: true if the character specification can repeat

export class StaticSegment implements ISegment {
    string: string;
    constructor(string: string) {
        this.string = string;
    }

    eachChar(callback: (charSpec: ICharacterSpecification) => void): void {
        for (let ch of this.string) {
            callback({ validChars: ch });
        }
    }

    regex(): string {
        return this.string.replace(escapeRegex, '\\$1');
    }

    generate(): string {
        return this.string;
    }
}

export class DynamicSegment implements ISegment {
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    eachChar(callback: (charSpec: ICharacterSpecification) => void): void {
        callback({ invalidChars: '/', repeat: true });
    }

    regex(): string {
        return '([^/]+)';
    }

    generate(params: Dictionary<string>, consumed: Dictionary<boolean>): string {
        consumed[this.name] = true;
        return params[this.name];
    }
}

export class StarSegment implements ISegment {
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    eachChar(callback: (charSpec: ICharacterSpecification) => void): void {
        callback({ invalidChars: '', repeat: true });
    }

    regex(): string {
        return '(.+)';
    }

    generate(params: Dictionary<string>, consumed: Dictionary<boolean>): string {
        consumed[this.name] = true;
        return params[this.name];
    }
}

export class EpsilonSegment implements ISegment {
    eachChar(): void { }
    regex(): string { return ''; }
    generate(): string { return ''; }
}

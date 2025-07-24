export class NewDocument {
    constructor(
        readonly title: string,
        readonly year: number,
        readonly keywords: string[],
        readonly author: string,
        readonly file: File
    ) {
    }
}

export class Doc {
    constructor(
        readonly title: string,
        readonly year: number,
        readonly keywords: string[],
        readonly author: string,
        readonly id: string,
        readonly uploadedAt: Date,
        readonly sizeInBytes: number,
        readonly wordCount: number
    ) {
    }
}
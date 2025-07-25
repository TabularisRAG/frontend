export type NewDocument = {
    readonly title: string;
    readonly year: number;
    readonly keywords: string[];
    readonly author: string;
    readonly file: File;
};

export type Doc = {
    readonly title: string;
    readonly year: number;
    readonly keywords: string[];
    readonly author: string;
    readonly id: string;
    readonly uploadedAt: Date;
    readonly sizeInBytes: number;
    readonly wordCount: number;
    readonly assigned_groups: {
        id: string;
        name: string;
    }[];
    readonly shared_for_whole_company: boolean;
    readonly owners: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    }[]
};
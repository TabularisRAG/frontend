export type Doc = {
    id: string;
    title: string;
    uploadedAt: Date;
    year: number;
    sizeInBytes: number;
    wordCount: number;
    author: string;
    keywords: string[];
    groupAccess: string[];
    userAccess: string[];
}

export type Group = {
    id: string;
    name: string;
    members: User[];
    leaders: User[];
    documents: Doc[];
}

export type User = {
    id: string;
    username: string;
    role: "user" | "admin";
    groups: Group[];
    documents: Doc[];
}
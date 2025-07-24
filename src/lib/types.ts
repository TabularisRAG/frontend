export type Group = {
    id: string;
    name: string;
    members: User[];
    leaders: User[];
    documents: Doc[];
}
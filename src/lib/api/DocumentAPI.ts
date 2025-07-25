import APIClient from "$lib/api/ApiClient";
import {type Doc, type NewDocument} from "$lib/entities/doc";

export class DocumentAPI extends APIClient {

    public async getDocuments(token: string): Promise<Array<Doc>> {
        try {
            const response = await fetch(this.serverURL + "/api/documents", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const docs = await response.json() as Array<any>;

            return docs.map((doc: any) => ({
                title: doc.title,
                year: doc.year,
                keywords: doc.keywords,
                author: doc.author,
                id: doc.id,
                uploadedAt: new Date(doc.uploaded_at),
                sizeInBytes: doc.size_byte,
                wordCount: doc.word_count,
                assigned_groups: doc.assigned_groups ? doc.assigned_groups : [],
                shared_for_whole_company: doc.shared_for_whole_company ? doc.shared_for_whole_company : false,
                owners: doc.owners ? doc.owners : []
            } as Doc))
        } catch (e) {
            console.error(e)
            return Promise.reject(e)
        }

    }

    public async getDocument(token: string, id: string): Promise<Doc> {
        const response = await fetch(this.serverURL + "/api/documents/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const doc = await response.json();
        return {
            title: doc.title,
            year: doc.year,
            keywords: doc.keywords,
            author: doc.author,
            id: doc.id,
            uploadedAt: new Date(doc.uploaded_at),
            sizeInBytes: doc.size_byte,
            wordCount: doc.word_count,
            assigned_groups: doc.assigned_groups ? doc.assigned_groups : [],
            shared_for_whole_company: doc.shared_for_whole_company ? doc.shared_for_whole_company : false,
            owners: doc.owners ? doc.owners : []
        } as Doc;

    }

    public async getFullMarkdown(token: string, id: string): Promise<string> {
        const response = await fetch(this.serverURL + "/api/documents/" + id + "/markdown", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        const res = await response.json();
        return res.markdown as string;
    }

    public async uploadDocument(token: string, document: NewDocument) {
        let formData = new FormData();
        formData.append("title", document.title);
        formData.append("year", document.year.toString());
        formData.append("author", document.author);
        formData.append("keywords", document.keywords.join(","));
        formData.append("file", document.file);

        const response = await fetch(this.serverURL + "/api/documents/upload", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
    }

    public async deleteDocument(token: string, id: string) {
        const response = await fetch(this.serverURL + "/api/documents/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
    }

    public async getDocumentChunk(token: string, id: string) {
        try {
            const res = await fetch(`${this.serverURL}/api/documents/chunks/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) throw new Error('Error loading citation');
            const json = await res.json();
            return json;
        } catch (err) {
            throw err
        }
    }

    public async assignDocumentsToGroups(token: string, documentIds: string[], groupIds?: string[], all?: boolean) {
        const response = await fetch(this.serverURL + "/api/documents/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                //TODO: finish request
            })
        })
    }

    public async unassignDocumentsToGroups(token: string, documentIds: string[], groupId?: string, all?: boolean) {
        const response = await fetch(this.serverURL + "/api/documents/unassign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                //TODO: finish request
            })
        })
    }


}
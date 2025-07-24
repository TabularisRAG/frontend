import APIClient from "$lib/api/ApiClient";
import {Doc, NewDocument} from "$lib/entities/doc";

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
            return docs.map((doc: any) => new Doc(
                doc.title,
                doc.year,
                doc.keywords,
                doc.author,
                doc.id,
                new Date(doc.uploaded_at),
                doc.size_byte,
                doc.word_count
            ))
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
        return new Doc(
            doc.title,
            doc.year,
            doc.keywords,
            doc.author,
            doc.id,
            new Date(doc.uploaded_at),
            doc.size_byte,
            doc.word_count
        );
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
}
import type {Doc} from "$lib/types";

export async function load() {

    const docs: Doc[] = [
        {
            id: "doc_2024_01",
            title: "Digitalisierungsstrategie 2025",
            author: "Dr. Maria Schmidt",
            uploadedAt: new Date("2024-01-15"),
            sizeInBytes: 2458632,
            keywords: ["Digitalisierung", "KI", "Prozessoptimierung", "Zukunftsstrategie"],
            wordCount: 15420,
            year: 2024,
            groupAccess: ["Vorstand", "IT-Abteilung"],
            userAccess: ["m.mueller@firma.de"]
        },
        {
            id: "doc_2024_02",
            title: "Global Sales Report Q1/2024",
            author: "Sales Department",
            uploadedAt: new Date("2024-04-05"),
            sizeInBytes: 1843200,
            keywords: ["Sales", "Revenue", "Market Analysis", "Quarterly Report"],
            wordCount: 14500,
            year: 2024,
            groupAccess: ["Management", "Sales"],
            userAccess: []
        },
        {
            id: "doc_2023_15",
            title: "IT Security Guidelines 2024",
            author: "Corporate IT Security",
            uploadedAt: new Date("2023-12-28"),
            sizeInBytes: 892928,
            keywords: ["Security", "Compliance", "IT Policy", "Guidelines"],
            wordCount: 7200,
            year: 2023,
            groupAccess: ["All Employees"],
            userAccess: []
        },
        {
            id: "doc_2024_03",
            title: "Projektdokumentation Solar-Campus",
            author: "Ing. Stefan Bauer",
            uploadedAt: new Date("2024-03-10"),
            sizeInBytes: 4194304,
            keywords: ["Erneuerbare Energien", "Photovoltaik", "Projektmanagement"],
            wordCount: 28900,
            year: 2024,
            groupAccess: ["Projektteam", "Facility Management"],
            userAccess: ["s.bauer@firma.de"]
        },
        {
            id: "doc_2024_04",
            title: "Employee Handbook 2024",
            author: "HR Department",
            uploadedAt: new Date("2024-01-02"),
            sizeInBytes: 3145728,
            keywords: ["HR", "Policies", "Benefits", "Code of Conduct"],
            wordCount: 25600,
            year: 2024,
            groupAccess: ["All Employees"],
            userAccess: []
        },
        {
            id: "doc_2024_05",
            title: "Marketingplan Q2/2024",
            author: "Marketing Team",
            uploadedAt: new Date("2024-03-25"),
            sizeInBytes: 1572864,
            keywords: ["Marketing", "Strategie", "Social Media", "Events"],
            wordCount: 12400,
            year: 2024,
            groupAccess: ["Marketing", "Communications"],
            userAccess: []
        },
        {
            id: "doc_2024_06",
            title: "Product Roadmap 2024-2025",
            author: "Product Management",
            uploadedAt: new Date("2024-02-20"),
            sizeInBytes: 2097152,
            keywords: ["Product Strategy", "Development", "Innovation", "Timeline"],
            wordCount: 16800,
            year: 2024,
            groupAccess: ["Product", "Development", "Management"],
            userAccess: ["p.jones@company.com"]
        },
        {
            id: "doc_2024_07",
            title: "Datenschutz-Richtlinien v2.1",
            author: "Rechtsabteilung",
            uploadedAt: new Date("2024-01-15"),
            sizeInBytes: 524288,
            keywords: ["DSGVO", "Compliance", "Datenschutz", "Richtlinien"],
            wordCount: 4500,
            year: 2024,
            groupAccess: ["Alle Mitarbeiter"],
            userAccess: []
        }
    ]

    const documents = new Promise<Doc[]>((resolve) => {
        setTimeout(() => {
            resolve(docs);
        }, 4000);
    });

    return {
        documents
    };

}
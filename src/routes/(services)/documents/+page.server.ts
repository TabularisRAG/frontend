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
        },
        {
            id: "doc_2024_08",
            title: "Quartalsbericht Finanzen Q1/2024",
            author: "Finanzabteilung",
            uploadedAt: new Date("2024-04-15"),
            sizeInBytes: 1843200,
            keywords: ["Finanzen", "Controlling", "Quartalszahlen"],
            wordCount: 12800,
            year: 2024,
            groupAccess: ["Management", "Finance"],
            userAccess: []
        },
        {
            id: "doc_2024_09",
            title: "ESG-Report 2023",
            author: "Sustainability Team",
            uploadedAt: new Date("2024-03-01"),
            sizeInBytes: 3670016,
            keywords: ["Nachhaltigkeit", "ESG", "Umwelt", "Corporate Responsibility"],
            wordCount: 24500,
            year: 2024,
            groupAccess: ["Management", "Communications", "ESG"],
            userAccess: []
        },
        {
            id: "doc_2024_10",
            title: "Mitarbeiterumfrage Ergebnisse",
            author: "HR Analytics",
            uploadedAt: new Date("2024-02-28"),
            sizeInBytes: 1048576,
            keywords: ["HR", "Feedback", "Mitarbeiterzufriedenheit"],
            wordCount: 8900,
            year: 2024,
            groupAccess: ["Management", "HR"],
            userAccess: []
        },
        {
            id: "doc_2024_11",
            title: "Cloud Migration Plan",
            author: "IT Infrastructure",
            uploadedAt: new Date("2024-03-15"),
            sizeInBytes: 2359296,
            keywords: ["Cloud", "Migration", "Infrastructure", "IT Strategy"],
            wordCount: 18600,
            year: 2024,
            groupAccess: ["IT-Abteilung", "Management"],
            userAccess: ["c.weber@firma.de"]
        },
        {
            id: "doc_2024_12",
            title: "Qualitätsmanagement-Handbuch",
            author: "QM-Team",
            uploadedAt: new Date("2024-01-20"),
            sizeInBytes: 4718592,
            keywords: ["Qualität", "ISO 9001", "Prozesse", "Standards"],
            wordCount: 32400,
            year: 2024,
            groupAccess: ["Alle Mitarbeiter"],
            userAccess: []
        },
        {
            id: "doc_2024_13",
            title: "Innovationsstrategie 2024+",
            author: "Innovation Lab",
            uploadedAt: new Date("2024-02-01"),
            sizeInBytes: 1677722,
            keywords: ["Innovation", "R&D", "Zukunftstechnologien"],
            wordCount: 13500,
            year: 2024,
            groupAccess: ["R&D", "Management"],
            userAccess: []
        },
        {
            id: "doc_2024_14",
            title: "Vertriebsplanung International",
            author: "International Sales",
            uploadedAt: new Date("2024-04-01"),
            sizeInBytes: 2097152,
            keywords: ["Vertrieb", "International", "Expansion"],
            wordCount: 16200,
            year: 2024,
            groupAccess: ["Sales", "Management"],
            userAccess: []
        },
        {
            id: "doc_2024_15",
            title: "Logistik-Optimierungsprojekt",
            author: "Supply Chain Management",
            uploadedAt: new Date("2024-03-20"),
            sizeInBytes: 3145728,
            keywords: ["Logistik", "Supply Chain", "Optimierung"],
            wordCount: 23400,
            year: 2024,
            groupAccess: ["Logistics", "Operations"],
            userAccess: ["l.schmidt@firma.de"]
        },
        {
            id: "doc_2024_16",
            title: "Corporate Design Guidelines",
            author: "Brand Management",
            uploadedAt: new Date("2024-02-15"),
            sizeInBytes: 15728640,
            keywords: ["Branding", "Design", "Corporate Identity"],
            wordCount: 9800,
            year: 2024,
            groupAccess: ["Marketing", "Communications", "All Employees"],
            userAccess: []
        },
        {
            id: "doc_2024_17",
            title: "Risikomanagement-Bericht",
            author: "Risk Management",
            uploadedAt: new Date("2024-04-10"),
            sizeInBytes: 1258291,
            keywords: ["Risiko", "Compliance", "Management"],
            wordCount: 10500,
            year: 2024,
            groupAccess: ["Management", "Compliance"],
            userAccess: []
        },
        {
            id: "doc_2024_18",
            title: "Nachhaltigkeits-Roadmap",
            author: "ESG Committee",
            uploadedAt: new Date("2024-03-30"),
            sizeInBytes: 2893756,
            keywords: ["Nachhaltigkeit", "ESG", "Green Initiative"],
            wordCount: 19700,
            year: 2024,
            groupAccess: ["Management", "ESG"],
            userAccess: []
        },
        {
            id: "doc_2024_19",
            title: "IT-Budgetplanung 2025",
            author: "IT Controlling",
            uploadedAt: new Date("2024-04-12"),
            sizeInBytes: 1572864,
            keywords: ["Budget", "IT", "Planung", "Finanzen"],
            wordCount: 11300,
            year: 2024,
            groupAccess: ["IT-Abteilung", "Finance"],
            userAccess: ["f.mueller@firma.de"]
        },
        {
            id: "doc_2024_20",
            title: "Cybersecurity-Trainingshandbuch",
            author: "Security Training Team",
            uploadedAt: new Date("2024-04-18"),
            sizeInBytes: 2359296,
            keywords: ["Cybersecurity", "Training", "Awareness", "IT-Sicherheit"],
            wordCount: 18200,
            year: 2024,
            groupAccess: ["Alle Mitarbeiter"],
            userAccess: []
        },
        {
            id: "doc_2024_21",
            title: "Lean Management Initiative",
            author: "Process Excellence",
            uploadedAt: new Date("2024-04-20"),
            sizeInBytes: 1835008,
            keywords: ["Lean", "Prozessoptimierung", "Effizienz"],
            wordCount: 14200,
            year: 2024,
            groupAccess: ["Management", "Operations"],
            userAccess: ["p.schmidt@firma.de"]
        },
        {
            id: "doc_2024_22",
            title: "KI-Implementierungsstrategie",
            author: "Digital Innovation Team",
            uploadedAt: new Date("2024-04-22"),
            sizeInBytes: 3145728,
            keywords: ["Künstliche Intelligenz", "Digitalisierung", "Innovation"],
            wordCount: 25800,
            year: 2024,
            groupAccess: ["IT-Abteilung", "Innovation Lab"],
            userAccess: []
        },
        {
            id: "doc_2024_23",
            title: "Workplace Safety Guidelines",
            author: "Health & Safety Department",
            uploadedAt: new Date("2024-04-25"),
            sizeInBytes: 1048576,
            keywords: ["Safety", "Workplace", "Guidelines", "Health"],
            wordCount: 8900,
            year: 2024,
            groupAccess: ["All Employees"],
            userAccess: []
        },
        {
            id: "doc_2024_24",
            title: "Customer Experience Report 2024",
            author: "CX Analytics Team",
            uploadedAt: new Date("2024-04-28"),
            sizeInBytes: 2097152,
            keywords: ["Customer Experience", "Analytics", "Service Quality"],
            wordCount: 16500,
            year: 2024,
            groupAccess: ["Customer Service", "Management"],
            userAccess: []
        },
        {
            id: "doc_2024_25",
            title: "Lieferantenrichtlinien 2024",
            author: "Procurement Department",
            uploadedAt: new Date("2024-04-30"),
            sizeInBytes: 1572864,
            keywords: ["Einkauf", "Lieferanten", "Compliance", "Standards"],
            wordCount: 12400,
            year: 2024,
            groupAccess: ["Procurement", "Quality Management"],
            userAccess: ["e.weber@firma.de"]
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
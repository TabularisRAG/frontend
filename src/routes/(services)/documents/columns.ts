import type {ColumnDef} from "@tanstack/table-core";
import type {Doc} from "$lib/types";
import {m} from '$lib/paraglide/messages.js';
import {getLocale} from '$lib/paraglide/runtime';
import {createRawSnippet} from "svelte";
import {renderComponent, renderSnippet} from "$lib/components/ui/data-table";
import KeywordBadges from "./KeywordBadges.svelte";
import {formatSize} from "$lib/utils";
import FilteringSortingHeader from "./FilteringSortingHeader.svelte";

export const columns: ColumnDef<Doc>[] = [
    {
        accessorKey: "title",
        header: ({column}) =>
            renderComponent(FilteringSortingHeader, {
                column: column,
                title: m['pages.documents.title']()
            }),
        cell: ({row}) => {
            const snippet = createRawSnippet<[String]>((getTitle) => {
                const title = getTitle();
                return {
                    render: () => `<span class="hyphens-auto">${title}</span>`
                }
            })
            return renderSnippet(snippet, row.getValue<string>("title"))
        }
    },
    {
        accessorKey: "author",
        header: ({column}) =>
            renderComponent(FilteringSortingHeader, {
                column: column,
                title: m['pages.documents.author']()
            }),
        cell: ({row}) => {
            const snippet = createRawSnippet<[String]>((getAuthor) => {
                const author = getAuthor();
                return {
                    render: () => `<span class="hyphens-auto">${author}</span>`
                }
            })
            return renderSnippet(snippet, row.getValue<string>("author"))
        }
    },
    {
        accessorKey: "year",
        header: ({column}) =>
            renderComponent(FilteringSortingHeader, {
                column: column,
                filtering: false,
                title: m['pages.documents.year']()
            }),
        cell: ({row}) => {
            const snippet = createRawSnippet<[String]>((getYear) => {
                const year = getYear();
                return {
                    render: () => `<span>${year}</span>`
                }
            });
            return renderSnippet(snippet, row.getValue<number>("year").toString())
        }
    },
    {
        accessorKey: "keywords",
        header: ({column}) =>
            renderComponent(FilteringSortingHeader, {
                column: column,
                title: m['pages.documents.keywords']()
            }),
        cell: ({row}) => {
            return renderComponent(KeywordBadges, {keywords: row.getValue<string[]>("keywords")})
        },
        filterFn: (row, _columnId, filterValue) => {
            const keywords = row.getValue<string[]>("keywords");
            return keywords.some(keyword => keyword.toLowerCase().includes(filterValue.toLowerCase()))
        }
    },
    {
        accessorKey: "uploadedAt",
        header: ({column}) =>
            renderComponent(FilteringSortingHeader, {
                column: column,
                filtering: false,
                title: m['pages.documents.uploadedAt']()
            }),
        cell: ({row}) => {
            const formatter = new Intl.DateTimeFormat(getLocale(), {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                minute: "2-digit",
                hour: "2-digit",
                hour12: false
            })
            const snippet = createRawSnippet<[String]>((getUploadedAt) => {
                const createdAt = getUploadedAt();
                return {
                    render: () => `<span>${createdAt}</span>`
                }
            });
            return renderSnippet(snippet, formatter.format(new Date(row.getValue<Date>("uploadedAt"))))
        },
        sortingFn: "datetime"
    },
    {
        accessorKey: "sizeInBytes",
        header: ({column}) =>
            renderComponent(FilteringSortingHeader, {
                column: column,
                filtering: false,
                title: m['pages.documents.size']()
            }),
        cell: ({row}) => {
            const snippet = createRawSnippet<[String]>((getSize) => {
                const size = getSize();
                return {
                    render: () => `<span>${size}</span>`
                }
            });
            return renderSnippet(snippet, formatSize(row.getValue<number>("sizeInBytes")))
        },
        sortingFn: "basic"
    }
]
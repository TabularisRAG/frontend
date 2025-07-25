<script lang="ts">
    import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "$lib/components/ui/card";
    import {Table, TableBody, TableCell, TableRow} from "$lib/components/ui/table";
    import {Badge} from "$lib/components/ui/badge";
    import {m} from '$lib/paraglide/messages.js';
    import SvelteMarkdown from '@humanspeak/svelte-markdown';
    import {formatDate, formatSize} from '$lib/utils';
    import type {PageProps} from "./$types";
    import HeadingRenderer from "$lib/components/HeadingRenderer.svelte";
    import ListRenderer from "$lib/components/ListRenderer.svelte";
    import TableRenderer from "$lib/components/TableRenderer.svelte";
    import TableHeadRenderer from "$lib/components/TableHeadRenderer.svelte";
    import TableBodyRenderer from "$lib/components/TableBodyRenderer.svelte";
    import TableCellRenderer from "$lib/components/TableCellRenderer.svelte";
    import TableRowRenderer from "$lib/components/TableRowRenderer.svelte";

    let {data}: PageProps = $props();

    let {markdown, document} = data;

</script>

<div class="container mx-auto py-8 space-y-6">
    <Card>
        <CardHeader>
            <CardTitle class="text-2xl">{document.title}</CardTitle>
            <CardDescription class="text-muted-foreground">
                {m.label_from()} {document.author} • {document.year}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div class="flex gap-2 flex-wrap mb-4">
                {#each document.keywords as keyword}
                    <Badge variant="secondary" class="px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {keyword}
                    </Badge>
                {/each}
            </div>

            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell class="font-medium">{m.doc_field_uploaded_at()}</TableCell>
                        <TableCell>{formatDate(document.uploadedAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell class="font-medium">{m.doc_field_size()}</TableCell>
                        <TableCell>{formatSize(document.sizeInBytes)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell class="font-medium">{m.doc_field_word_count()}</TableCell>
                        <TableCell>{document.wordCount} {m.label_words({count: document.wordCount})}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </CardContent>
    </Card>

    <Card>
        <CardHeader>
            <CardTitle>{m.label_content()}</CardTitle>
        </CardHeader>
        <CardContent>
            <div>
                {#await markdown then md}
                    <SvelteMarkdown renderers={{
                    heading: HeadingRenderer,
                    list: ListRenderer,
                    table: TableRenderer,
                    tablehead: TableHeadRenderer,
                    tablebody: TableBodyRenderer,
                    tablecell: TableCellRenderer,
                    tablerow: TableRowRenderer
                }} source={md}/>
                {/await}
            </div>
        </CardContent>
    </Card>
</div>
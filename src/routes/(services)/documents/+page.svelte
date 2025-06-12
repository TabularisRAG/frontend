<script>
    import DataTable from "./DataTable.svelte";
    import {columns} from "./columns.js";

    let {data} = $props();
</script>
<div class="m-8">
    {#await data.documents}
        <DataTable {columns} data={[]}/>
    {:then documents}
        <DataTable {columns} data={documents}/>
    {/await}
</div>

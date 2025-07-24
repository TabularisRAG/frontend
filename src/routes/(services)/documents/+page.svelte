<script>
    import DataTable from "./DataTable.svelte";
    import {columns} from "./columns.js";

    let {data} = $props();

    let cols = columns(data.token);
</script>
<div class="m-8">
    <DataTable columns={cols} data={data.documents}/>
</div>

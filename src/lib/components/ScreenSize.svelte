<script lang="ts">
    let {
        width = $bindable(),
        isSm = $bindable(false),
        isMd = $bindable(false),
        isLg = $bindable(false),
        isXl = $bindable(false),
        is2Xl = $bindable(false)
    }: { 
        width?: number, 
        isSm?: boolean,
        isMd?: boolean,
        isLg?: boolean,
        isXl?: boolean,
        is2Xl?: boolean
    } = $props();

    $effect(() => {
        if (width === undefined) {
            isSm = false;
            isMd = false;
            isLg = false;
            isXl = false;
            is2Xl = false;
            return;
        }

        isSm = width >= 640;
        isMd = width >= 768;
        isLg = width >= 1024;
        isXl = width >= 1280;
        is2Xl = width >= 1536;
    });
</script>

<svelte:window bind:outerWidth={width}></svelte:window>
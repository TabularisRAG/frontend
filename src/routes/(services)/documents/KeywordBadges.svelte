<script lang="ts">
    import {Badge} from "$lib/components/ui/badge";
    import * as Tooltip from "$lib/components/ui/tooltip";

    let {keywords}: { keywords: string[] } = $props()
</script>

<span class="flex gap-1 flex-row flex-wrap">
    {#each keywords as keyword}
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                  <Badge variant="secondary" class="max-w-28 truncate block">
                      {keyword}
                 </Badge>
                 </Tooltip.Trigger>
            <Tooltip.Content>
              <p>{keyword}</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
    {/each}
</span>
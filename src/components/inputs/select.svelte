<script lang="ts">
  export let options: { label: string; id: number | string | null; }[] = [];
  export let value: number | string | null = 0;
  export let withEmptyItem: boolean = false;
  export let emptyItemText: string = "None";
</script>

<select-component>
  <select bind:value>
    {#if withEmptyItem}
      <option value={null}>{emptyItemText}</option>
    {/if}

    {#each options as { label, id }}
      <option value={id}>{label}</option>
    {/each}
  </select>
  <select-arrow />
</select-component>

<style lang="scss">
  select-component {
    @apply relative;
    @apply inline-block;
    @apply w-full;
    select {
      @apply inline-block;
      @apply w-full;
      @apply cursor-pointer;
      @apply p-4;
      @apply outline-0;
      @apply border border-background-tertiary;
      @apply rounded-lg;
      @apply bg-background-tertiary;
      @apply text-color-default;
      @apply appearance-none;
    }

    select:hover,
    select:focus {
      @apply bg-background-tertiary;
    }
    select:disabled {
      @apply opacity-50;
      @apply cursor-not-allowed;
    }
    select-arrow {
      @apply absolute;
      @apply top-6;
      @apply right-5;
      @apply w-0;
      @apply h-0;
      @apply border-t-0;
      @apply border-r-2;
      @apply border-b-2;
      @apply border-l-0;
      @apply inline-block;
      @apply p-1;
      @apply rotate-45;
      @apply border-action-primary;
    }
  }
</style>

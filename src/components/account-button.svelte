<script lang="ts">
  import { Dot } from '$components';

  export let disabled: boolean = false;
  export let onClick: () => void = () => {};
  export let title: string = '';
</script>

<button on:click={onClick} {disabled}>
  <div><Dot /></div>
  <span>
    {title}
  </span>
</button>

<style lang="scss">
  button {
    @apply rounded-md;
    @apply cursor-pointer;
    @apply w-full flex flex-row space-x-2 items-center justify-center;
    @apply bg-background-primary;
    @apply text-color-primary;
    @apply font-semibold;
    @apply text-center;
    @apply text-color-default;
    @apply p-3;
  }
</style>

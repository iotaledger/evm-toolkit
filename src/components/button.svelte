<script lang="ts">
  import { ButtonHtmlType, handleEnterKeyDown } from '$lib/common';

  export let compact: boolean = false;
  export let title: string = '';
  export let url: string = '';
  export let htmlType: ButtonHtmlType = ButtonHtmlType.Button;
  export let disabled: boolean = false;
  export let danger: boolean = false;
  export let onClick: () => void = () => {};
  export let isExternal: boolean = false;
  export let stretch: boolean = false;
  export let busy: boolean = false;
  export let secondary: boolean = false;
  export let ghost: boolean = false;
  export let busyMessage: string = 'Loading...';

  $: href = htmlType === ButtonHtmlType.Link ? url : undefined;
  $: target =
    htmlType === ButtonHtmlType.Link && isExternal ? '_blank' : undefined;
  $: rel =
    htmlType === ButtonHtmlType.Link && isExternal
      ? 'noopener noreferrer'
      : undefined;
</script>

<svelte:element
  this={htmlType}
  {href}
  {target}
  {rel}
  disabled={disabled || busy}
  on:click={onClick}
  on:keydown={event => handleEnterKeyDown(event, onClick)}
  class:danger
  class:w-full={stretch}
  class:secondary
  class:compact
  class:ghost
>
  {busy ? busyMessage : title}
</svelte:element>

<style lang="scss">
  button,
  a {
    @apply bg-action-primary;
    @apply text-text-primary;
    @apply font-semibold;
    @apply p-3;
    @apply rounded-md;
    @apply text-center;
    @apply transition-all;

    &:disabled {
      @apply opacity-50;
      @apply cursor-not-allowed;
    }

    &.secondary {
      @apply bg-background-primary;
      @apply border-0;
      @apply text-text-secondary;
    }
    &.danger {
      @apply bg-background-error;
      @apply text-text-error;
    }

    &.ghost {
      @apply bg-transparent;
      @apply text-action-primary;
      @apply border border-action-primary;
      &.secondary {
        @apply border-text-secondary;
      }
      &.danger {
        @apply border-text-error;
      }
    }

    &.compact {
      @apply p-1;
    }
  }
</style>

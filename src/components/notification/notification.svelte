<script lang="ts">
  import type { NotificationType } from '$lib/notification';

  export let type: NotificationType;
  export let message: string;
  export let onClose: () => void;
</script>

<notification-toast
  class="rounded-xl flex flex-row justify-center max-md:mx-2 items-center bg-zinc-200 p-3 {type}"
>
  <notification-message>{message}</notification-message>
  <button
    on:click={onClose}
    class="ml-auto font-bold text-18 h-4 leading-none px-1"
  >
    &#x2715;
  </button>
</notification-toast>

<style lang="scss">
  notification-toast {
    notification-message {
      @apply ml-3;
      word-break: break-word;
    }
    &.success {
      @apply bg-background-success;
      notification-message,
      button {
        @apply text-action-primary;
      }
    }
    &.error {
      @apply bg-background-error;
      notification-message,
      button {
        @apply text-text-error;
      }
    }
    &.warning {
      @apply bg-background-warning;
      notification-message,
      button {
        @apply text-text-secondary;
      }
    }
  }
</style>

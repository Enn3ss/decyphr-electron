<template>
  <li>
    <a
      href="#"
      class="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-navy-500"
      @click="clickEvent"
    >
      <slot name="icon" />
      <slot />
    </a>
  </li>
</template>
  
  <script setup lang="ts">
  const emit = defineEmits<{ 'click': [] }>();

  function clickEvent(): void {
    emit('click');
  }
  </script>
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center"
  >
    <div class="bg-navy-900 p-8 rounded-lg shadow-lg max-w-sm w-full">
      <h2 class="text-lg font-semibold mb-4">
        {{ props.title }}
      </h2>
      <p class="mb-6">
        {{ props.message }}
      </p>
      <button
        class="hover:scale-125 duration-200 bg-red font-bold py-2 px-4 rounded"
        @click="confirm"
      >
        Confirm
      </button>
      <button
        class="hover:bg-navy-500 font-bold py-2 px-4 rounded"
        @click="cancel"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineModel } from 'vue';

const props = defineProps<{ title: string, message: string }>();
const emit = defineEmits<{ 'confirm': [] }>();
const modelValue = defineModel<boolean>({required: true, default: false});

function confirm(): void {
  modelValue.value = false;
  emit('confirm');
}

function cancel(): void {
  modelValue.value = false;
}
</script>
<template>
  <div>
    <h1 class="flex items-center text-2xl">
      {{ props.message + timeDisplay }}
      <component
        :is="isPaused ? PlayIcon : PauseIcon"
        class="hover:scale-125 duration-200 cursor-pointer h-9 w-9 ml-5"
        @click="togglePause"
      />
      <StopIcon
        class="hover:scale-125 duration-200 cursor-pointer h-9 w-9 ml-3"
        @click="stopTimer"
      />
    </h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import PauseIcon from '/src/assets/icons/circle-pause-solid.svg';
import PlayIcon from '/src/assets/icons/circle-play-solid.svg';
import StopIcon from '/src/assets/icons/circle-stop-solid.svg';

const props = defineProps<{ message: string }>();
const emit = defineEmits<{ 'timer-stopped': [string] }>();
const isPaused = ref(false);
const intervalId = ref<number | null>(null);
const elapsedTime = ref(0);

const timeDisplay = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
});

function padZero(value: number): string {
  return value.toString().padStart(2, '0');
}

function startTimer(): void {
  // setInterval is a browser API that allows functions to execute repeatedly at the given interval
  intervalId.value = window.setInterval(() => {
    if (!isPaused.value) {
      elapsedTime.value++;
    }
  }, 1000);
}

function togglePause(): void {
    isPaused.value = !isPaused.value;
    console.log('duration: ' + timeDisplay.value);
}

function stopTimer(): void {
  if (intervalId.value) {
    const duration = timeDisplay.value;
    clearInterval(intervalId.value);
    intervalId.value = null;
    elapsedTime.value = 0;
    isPaused.value = false;
    emit('timer-stopped', duration);
  }
}

startTimer();

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>
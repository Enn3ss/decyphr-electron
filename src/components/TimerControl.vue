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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import PauseIcon from '/src/assets/icons/circle-pause-solid.svg';
import PlayIcon from '/src/assets/icons/circle-play-solid.svg';
import StopIcon from '/src/assets/icons/circle-stop-solid.svg';

const props = defineProps<{ message: string }>();
const emit = defineEmits<{ 'timer-stopped': [string], 'toggle-pause': [boolean] }>();
const isPaused = ref(false);
const elapsedTime = ref(0);
const startTime = ref(0);
const pauseTime = ref(0);
let intervalId: number | null = null;

const timeDisplay = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600);
  const minutes = Math.floor((elapsedTime.value % 3600) / 60);
  const seconds = elapsedTime.value % 60;
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
});

function padZero(value: number): string {
  return value.toString().padStart(2, '0');
}

function updateElapsedTime(): void {
  if (!isPaused.value) {
    const now = performance.now();
    elapsedTime.value = Math.floor((now - startTime.value + pauseTime.value) / 1000);
  }
}

function startTimer(): void {
  startTime.value = performance.now();
  intervalId = window.setInterval(updateElapsedTime, 1000);
}

function togglePause(): void {
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    const now = performance.now();
    pauseTime.value += now - startTime.value;
    if(intervalId) {
      clearInterval(intervalId);
    intervalId = null;
    }

  } else {
    startTime.value = performance.now();
    intervalId = window.setInterval(updateElapsedTime, 1000);
  }
  emit('toggle-pause', isPaused.value);
  console.log('duration: ' + timeDisplay.value);
}

function stopTimer(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    const duration = timeDisplay.value;
    elapsedTime.value = 0;
    startTime.value = 0;
    pauseTime.value = 0;
    isPaused.value = false;
    emit('timer-stopped', duration);
  }
}

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
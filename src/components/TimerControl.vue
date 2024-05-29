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
import { timerService } from '../services/timerService.ts';
import { formatMilitaryTime } from '../services/utilityService.ts';
import PauseIcon from '/src/assets/icons/circle-pause-solid.svg';
import PlayIcon from '/src/assets/icons/circle-play-solid.svg';
import StopIcon from '/src/assets/icons/circle-stop-solid.svg';

const props = defineProps<{ message: string }>();
const emit = defineEmits<{ 'timer-stopped': [string], 'toggle-pause': [boolean] }>();
const isPaused = ref(false);
const elapsedTime = ref(0);
const totalElapsedTime = ref(0);
let intervalId: number | null = null;

const timeDisplay = computed(() => {
  return formatMilitaryTime(totalElapsedTime.value);
});

function togglePause(): void {
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    timerService.pause();
    clearInterval(intervalId as number);
  } else {
    timerService.resume();
    startInternalTimer();
  }
  emit('toggle-pause', isPaused.value);
}

function stopTimer(): void {
  timerService.stop();
  clearInterval(intervalId as number);
  emit('timer-stopped', timeDisplay.value);
}

function updateElapsedTime(elapsed: number): void {
  elapsedTime.value = Math.floor(elapsed / 1000);
}

function startInternalTimer(): void {
  intervalId = window.setInterval(() => {
    totalElapsedTime.value++;
  }, 1000);
}

onMounted(() => {
  timerService.subscribe(updateElapsedTime);
  totalElapsedTime.value = Math.floor(timerService.getElapsed() / 1000);
  if (!isPaused.value) {
    startInternalTimer();
  }
});

onUnmounted(() => {
  clearInterval(intervalId as number);
  timerService.unsubscribe(updateElapsedTime);
  timerService.stop();
});
</script>
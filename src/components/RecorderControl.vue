<template>
  <div>
    <div
      v-if="!props.isRecordingMeeting"
      class="flex items-center"
    >
      <h1 class="text-2xl">
        {{ title }}
      </h1>
      <MicIcon
        class="hover:scale-125 duration-200 cursor-pointer h-9 w-9 ml-5"
        @click="startRecordingMeeting"
      />
    </div>
    <div v-else>
      <TimerControl
        :message="timerMessage"
        @timer-stopped="stopRecordingMeeting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MicIcon from '/src/assets/icons/microphone-solid.svg';
import TimerControl from './TimerControl.vue';

const props = defineProps<{ isRecordingMeeting: boolean }>();
const emit = defineEmits<{ 'recording-status': [boolean] }>();
const title = ref('Let\'s record this meeting');
const timerMessage = 'This meeting has been going on ';

function startRecordingMeeting(): void {
  emit('recording-status', true);
}

function stopRecordingMeeting(duration: string): void {
  title.value = 'The meeting concluded after ' + duration + '. Click the mic to start another meeting!';
  emit('recording-status', false);
}

function resetTitle(): void {
  title.value = 'Let\'s record this meeting';
}

defineExpose({ resetTitle });
</script>
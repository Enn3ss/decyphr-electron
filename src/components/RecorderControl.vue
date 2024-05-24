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
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks: Blob[] = [];

const path = require('path');
const fs = require('fs');
const os = require('os');

async function startRecordingMeeting(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder.value = new MediaRecorder(stream);

  mediaRecorder.value.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.value.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const documentsPath = path.join(os.homedir(), 'Documents', 'Decyphr');
    if (!fs.existsSync(documentsPath)) {
      fs.mkdirSync(documentsPath, { recursive: true });
    }

    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeString = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
    const folderName = `${dateString}-T-${timeString.substring(0, 5)}-Recording`;

    const recordingPath = path.join(documentsPath, folderName);
    if (!fs.existsSync(recordingPath)) {
      fs.mkdirSync(recordingPath, { recursive: true });
    }

    const filePath = path.join(recordingPath, `${folderName}.wav`);
    fs.writeFile(filePath, buffer, () => console.log('Recording saved at', filePath));
  };

  mediaRecorder.value.start();
  emit('recording-status', true);
}

function stopRecordingMeeting(duration: string): void {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop();
    title.value = 'The meeting concluded after ' + duration + '. Click the mic to start another meeting!';
    emit('recording-status', false);
  }
}

function resetTitle(): void {
  title.value = 'Let\'s record this meeting';
}

defineExpose({ resetTitle });
</script>
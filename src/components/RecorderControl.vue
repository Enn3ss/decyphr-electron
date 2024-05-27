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
let mediaRecorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let recordingQueue: Promise<void> = Promise.resolve();
let chunkCounter = 1;
let isRecording = false;
let recordingFolderPath: string;

const path = require('path');
const fs = require('fs');
const os = require('os');

async function startRecordingMeeting(): Promise<void> {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  isRecording = true;
  emit('recording-status', true);
  chunkCounter = 1;

  // Determine the next recording folder name
  const documentsPath = path.join(os.homedir(), 'Documents', 'Decyphr');
  if (!fs.existsSync(documentsPath)) {
    fs.mkdirSync(documentsPath, { recursive: true });
  }

  const date = new Date();
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

  let recordingNumber = 1;
  while (fs.existsSync(path.join(documentsPath, `Recording-${recordingNumber}-${dateString}`))) {
    recordingNumber++;
  }

  recordingFolderPath = path.join(documentsPath, `Recording-${recordingNumber}-${dateString}`);
  fs.mkdirSync(recordingFolderPath, { recursive: true });

  recordChunk();
}

function recordChunk(): void {
  if (!stream) return;

  mediaRecorder = new MediaRecorder(stream);
  const localChunks: Blob[] = [];

  mediaRecorder.ondataavailable = (event) => {
    localChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(localChunks, { type: 'audio/wav' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Enqueue the saving process to ensure it runs sequentially
    recordingQueue = recordingQueue.then(() => saveRecordingChunk(buffer));

    // Start the next chunk if still recording
    if (isRecording) {
      recordChunk();
    }
  };

  mediaRecorder.start();

  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, 30000); // Stop after 30 seconds
}

async function saveRecordingChunk(buffer: Buffer): Promise<void> {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-mm-ss
  const fileName = `Chunk-${chunkCounter}-${dateString}-T-${timeString}.wav`;
  const filePath = path.join(recordingFolderPath, fileName);

  fs.writeFile(filePath, buffer, () => console.log('Recording saved at', filePath));
  chunkCounter++;
}

function stopRecordingMeeting(duration: string): void {
  isRecording = false;
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  title.value = 'The meeting concluded after ' + duration + '. Click the mic to start another meeting!';
  emit('recording-status', false);
}

function resetTitle(): void {
  title.value = 'Let\'s record this meeting';
}

defineExpose({ resetTitle });
</script>

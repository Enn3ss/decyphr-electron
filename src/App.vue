<template>
  <div class="flex justify-center items-center h-screen">
    <SidebarMenu 
      :is-recording-meeting="isRecordingMeeting"
      @reset-title="resetTitle"
    />
    <RecorderControl
      ref="recorderControl"
      :is-recording-meeting="isRecordingMeeting"
      @recording-status="setRecordingStatus"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SidebarMenu from './components/SidebarMenu.vue';
import RecorderControl from './components/RecorderControl.vue';

const isRecordingMeeting = ref(false);
const recorderControl = ref<InstanceType<typeof RecorderControl> | null>(null);

function resetTitle(): void {
  if(recorderControl.value) {
    recorderControl.value.resetTitle();
  }
}

function setRecordingStatus(status: boolean): void {
  isRecordingMeeting.value = status;
}
</script>
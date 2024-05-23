<template>
  <AppDialog
    v-model="warnUser"
    :title="dialogTitle"
    :message="dialogMessage"
  />
  <div class="flex h-full">
    <div
      :class="`bg-navy-700 w-64 py-7 px-2 absolute inset-y-0 left-0 transform 
      ${!isOpen ? '-translate-x-full' : ''} 
      transition duration-200 ease-in-out flex flex-col`"
    >
      <ul class="flex-grow space-y-6 mt-10">
        <SidebarMenuItem @click="returnHome">
          <template #icon>
            <HomeIcon class="h-4 w-4 mr-5" />
          </template>
          Home
        </SidebarMenuItem>
        <SidebarMenuItem @click="openCollection">
          <template #icon>
            <FolderIcon class="h-4 w-4 mr-5" />
          </template>
          Collection
        </SidebarMenuItem>
        <SidebarMenuItem @click="openSettings">
          <template #icon>
            <SettingsIcon class="h-4 w-4 mr-5" />
          </template>
          Settings
        </SidebarMenuItem>
      </ul>
      <h1 class="text-3xl font-bold text-center mt-auto">
        DECYPHR
      </h1>
    </div>
    <MenuIcon
      class="hover:bg-navy-700 cursor-pointer p-2 m-2 absolute h-10 w-10 top-0 left-0"
      @click="toggleSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppDialog from './AppDialog.vue'
import SidebarMenuItem from './SidebarMenuItem.vue'
import MenuIcon from '/src/assets/icons/bars-solid.svg'
import HomeIcon from '/src/assets/icons/house-chimney-solid.svg'
import FolderIcon from '/src/assets/icons/folder-closed-solid.svg'
import SettingsIcon from '/src/assets/icons/gear-solid.svg'

const props = defineProps<{ isRecordingMeeting: boolean }>();
const emit = defineEmits<{ 'reset-title': [] }>();
const isOpen = ref(false);
const warnUser = ref(false);
const dialogTitle = 'Warning!';
const dialogMessage = 'You are currently recording a meeting. Please stop the recording before leaving this page.';

function returnHome(): void {
  if (props.isRecordingMeeting) {
    warnUser.value = true;
  }
  else {
    isOpen.value = false;
    emit('reset-title');
  }
}

function openCollection(): void {
  if (props.isRecordingMeeting) {
    warnUser.value = true;
  }
}

function openSettings(): void {
  if (props.isRecordingMeeting) {
    warnUser.value = true;
  }
}

function toggleSidebar(): void {
  isOpen.value = !isOpen.value;
}
</script>
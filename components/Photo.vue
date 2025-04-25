<script setup lang="ts">
import type { Photo } from '~/models/entry';
import axios from 'axios';

const props = defineProps<{
  photo: Photo
}>();
const emit = defineEmits(['progress', 'create', 'delete'])

const backendRoute = import.meta.env.VITE_BACKEND
let abortController: AbortController | null = null

const uploadPhoto = async (): Promise<void> => {
  if (!props.photo.file) {
    return;
  }

  abortController = new AbortController();

  const formData = new FormData();
  formData.append('photo', props.photo.file);

  await axios.post(`${backendRoute}/api/entry/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: abortController.signal,
    onUploadProgress(e) {
      emit('progress', Math.round((e.loaded * 100) / (e.total || 1)));
    },
  }).then(response => emit('create', response.data));
};

const deletePhoto = async (): Promise<void> => {
  try {    
    await axios.delete(`${backendRoute}/api/entry/photo`, {
      data: { name: props.photo.name }
    });
    emit('delete', props.photo.name);
  } catch (e) {
    alert('Deleting image failed!');
  }
};

const onCancel = (): void => {
  if (abortController) {
    abortController.abort();
    emit('delete', props.photo.name);
  }
};

onMounted(uploadPhoto);
</script>

<template>
  <!-- uploaded item -->
  <div 
    v-if="photo.url"
    class="h-12 px-4 py-2.5 border border-[#8AC33E] rounded-2xl border-dashed bg-[#E7F3D8] flex items-center justify-between"
  >
    <div class="flex items-center space-x-2">
      <div class="flex items-center justify-center size-7 rounded-full bg-[#8AC33E]">
        <IconsTickCheck />
      </div>
      <div class=" font-normal text-[10px] text-neutral-700">{{ toPersianDigits(photo.name) }}</div>
    </div>

    <div class="flex items-center space-x-4">
      <a :href="backendRoute + photo.url" target="_blank">
        <IconsEye class=" cursor-pointer" />
      </a>
      <IconsTrash 
        class=" cursor-pointer" 
        @click="deletePhoto" 
      />
    </div>
  </div>

  <!-- item to upload -->
  <div 
    v-else 
    class="h-[70px] px-4 py-2.5 border border-[#8AC33E] rounded-2xl border-dashed bg-[#E7F3D8] flex items-center space-x-4"
  >
    <div class="flex items-center space-x-2 grow">
      <div class="flex items-center justify-center size-7 rounded-full bg-[#8AC33E]">
        <IconsDirectBoxSend />
      </div>
      <div class="grow space-y-2">
        <div class="flex items-center justify-between font-normal text-[10px] text-neutral-700">
          <div>{{ toPersianDigits(photo.name) }}</div>
          <div>{{ toPersianDigits(String(photo.progress)) }}%</div>
        </div>
        
        <div class="w-full bg-neutral-200 rounded-full h-1.5">
          <div class="bg-[#6E9C30] h-1.5 rounded-full" :style="{ width: `${photo.progress}%` }"></div>
        </div>
      </div>
    </div>

    <IconsCircleX class="cursor-pointer" @click="onCancel" />
  </div>
</template>

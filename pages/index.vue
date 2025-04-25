<script setup lang="ts">
import type { BackendEntry, Entry, Photo } from '~/models/entry';
import axios from 'axios';

const backendRoute = import.meta.env.VITE_BACKEND

const form = ref<Entry>({
  title: '',
  description: '',
  date: '',
  photos: [],
});

const loadingData = ref<boolean>(false);
const loading = ref<boolean>(false);
const uploadedPhotos = ref<Photo[]>([]);

const handlePhotos = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) {
    return;
  }

  for (const file of files) {
    const entry = ref({ url: null, progress: 0, name: file.name });
    uploadedPhotos.value.push(entry.value);
    uploadPhoto(file, entry);
  }
};

const uploadPhoto = async (file: File, entry: Ref<Photo>): Promise<void> => {
  const formData = new FormData();
  formData.append('photo', file);

  await axios.post(`${backendRoute}/api/entry/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress(e) {
      entry.value.progress = Math.round((e.loaded * 100) / (e.total || 1));
    },
  }).then(response => {
    entry.value.url = response.data.url;
    entry.value.name = response.data.name;
  });
};

const deletePhoto = async (photo: Photo): Promise<void> => {
  try {
    uploadedPhotos.value = uploadedPhotos.value.filter(item => item.name !== photo.name);
    
    await axios.delete(`${backendRoute}/api/entry/photo`, {
      data: { name: photo.name }
    });
  } catch (e) {
    alert('Deleting image failed!');
  }
};

const handleSubmit = async (): Promise<void> => {
  loading.value = true;

  form.value.photos = uploadedPhotos.value.filter(item => typeof item.url === 'string').map(photo => photo.name);

  try {
    await axios.post(`${backendRoute}/api/entry`, form.value)
  } catch (e) {
    alert('Can not submit the form!');
  } finally {
    loading.value = false
  }
};

const loadInitialData = async () => {
  loadingData.value = true

  try {
    const resp = await axios.get(`${backendRoute}/api/entry`);

    const data = resp.data as BackendEntry | null;

    if (data) {
      uploadedPhotos.value = data.photos
      form.value = {...data, photos: data.photos.map(item => item.name)};
    }
  } catch (e) {
    alert('Can not load data!');
  } finally {
    loadingData.value = false;
  }
};

onMounted(loadInitialData);
</script>

<template>
  <div dir="rtl" class="size-full flex items-center justify-center py-5">
    <div class="max-w-[360px] min-w-[360px] px-4 border border-neutral-400 rounded-xl p-4 space-y-6">
      <header class="flex items-center justify-center relative">
        <h1 class="text-neutral-800 font-medium text-base">اطلاعات مدارک پزشکی</h1>

        <IconsArrowRight class="text-neutral-800 absolute right-0" />
      </header>

      <form @submit.prevent="handleSubmit">
        <!-- fields -->
        <div class="space-y-4 mb-6 pb-0.5">
          <!-- title -->
          <div class="relative">
            <input 
              id="title"
              name="title"
              v-model="form.title" 
              type="text" 
              class="w-full border border-neutral-400 outline-none focus:border-neutral-500 rounded-2xl placeholder:relative placeholder:-top-0.5 placeholder:text-neutral-300 placeholder:font-normal placeholder:text-sm text-neutral-800 font-normal text-sm py-4 ps-11"
              placeholder="عنوان بیماری یا مدرک پزشکی" 
            />
            <label for="title" class="absolute top-1/2 -translate-y-1/2 start-4">
              <IconsPenAdd />
            </label>
          </div>

          <!-- description -->
          <textarea 
            v-model="form.description" 
            class="w-full border border-neutral-400 outline-none focus:border-neutral-500 rounded-2xl placeholder:text-neutral-300 placeholder:font-normal placeholder:text-sm text-neutral-800 font-normal text-sm py-3 ps-3 pe-4 resize-none min-h-[141px]"
            placeholder="توضیحات خودتون رو اینجا بنویسید"
          ></textarea>

          <!-- date -->
          <div class="relative pt-2">
            <div class="relative">
              <DateInput
                v-model="form.date"
                id="date"
                name="date"
                type="text" 
                placeholder="مثلاً ۱۴۰۳/۰۲/۰۵"
                class="w-full border border-neutral-400 outline-none focus:border-neutral-500 rounded-2xl placeholder:text-neutral-300 placeholder:font-normal placeholder:text-sm text-neutral-800 font-normal text-sm py-4 ps-11"
              />
              <label for="date" class="absolute top-1/2 -translate-y-1/2 start-4">
                <IconsCalendar />
              </label>
            </div>

            <div class=" font-normal text-neutral-400 text-[10px] absolute z-10 top-0 bg-white start-10 px-1">
              تاریخ مدرک پزشکی
            </div>
          </div>
        </div>

         <!-- uploads -->
        <div class="space-y-4 mb-13">
          <!-- title -->
          <div class="flex items-center justify-start space-x-2">
            <div class="w-1.5 h-[34px] rounded-l-md bg-[#8AC33E]"></div>

            <h3 class="font-medium text-sm text-neutral-800">بارگذاری مدرک پزشکی</h3>
          </div>

          <!-- input -->
          <div>
            <label for="file" class="w-full h-[76px] border border-[#8AC33E] rounded-2xl border-dashed bg-[#E7F3D8] flex items-center justify-center cursor-pointer">
              <div class="flex flex-col items-center space-y-2">
                <IconsUpload />
                <div class=" text-[#527524] font-medium text-xs">انتخاب فایل</div>
              </div>
            </label>

            <input 
              id="file" 
              name="file" 
              type="file" 
              multiple 
              @change="handlePhotos" 
              class="hidden" 
            />
          </div>

          <!-- items -->
          <div dir="ltr" class="space-y-2">
            <template 
              v-for="(photo, index) in uploadedPhotos"
              :key="index"
            >
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
                    @click="deletePhoto(photo)" 
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

                <IconsCircleX class="cursor-pointer" />
              </div>
            </template>
          </div>
        </div>

        <!-- submit btn -->
        <button 
          :disabled="loading" 
          type="submit" 
          class="font-normal text-sm text-[#FCFCFC] bg-[#8AC33E] w-full rounded-4xl h-10 cursor-pointer flex items-center justify-center"
        >
          <IconsSpin v-if="loading" class="size-5 animate-spin text-white" />
          <template v-else>
            ثبت
          </template>
        </button>
      </form>
    </div>
  </div>
</template>

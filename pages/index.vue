<template>
  <div dir="rtl" class="min-w-screen min-h-screen flex items-center justify-center">
    <div class="max-w-[360px] min-w-[360px] px-4 border border-neutral-400 rounded-xl p-4 space-y-6">
      <header class="flex items-center justify-center relative">
        <h1 class="text-neutral-800 font-medium text-base">اطلاعات مدارک پزشکی</h1>

        <IconsArrowRight class="text-neutral-800 absolute right-0" />
      </header>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- title -->
        <div class="relative">
          <input 
            id="title"
            name="title"
            v-model="form.title" 
            type="text" 
            class="w-full border border-neutral-400 outline-none focus:border-neutral-500 rounded-2xl placeholder:text-neutral-300 placeholder:font-normal placeholder:text-sm text-neutral-800 font-normal text-sm py-4 ps-11"
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
            <input 
              id="date"
              name="date"
              v-model="form.date" 
              type="text" 
              class="w-full border border-neutral-400 outline-none focus:border-neutral-500 rounded-2xl placeholder:text-neutral-300 placeholder:font-normal placeholder:text-sm text-neutral-800 font-normal text-sm py-4 ps-11"
              placeholder="عنوان بیماری یا مدرک پزشکی" 
            />
            <label for="date" class="absolute top-1/2 -translate-y-1/2 start-4">
              <IconsCalendar />
            </label>
          </div>

          <div class=" font-normal text-neutral-400 text-[10px] absolute z-10 top-0 bg-white start-10 px-1">
            تاریخ مدرک پزشکی
          </div>
        </div>

         <!-- uploads -->
        <div class=" space-y-4">
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

          <div>
            <div class="flex flex-wrap gap-2 mt-2">
              <img
                v-for="(img, idx) in photoPreviews"
                :key="idx"
                :src="img"
                class="w-20 h-20 object-cover rounded"
              />
            </div>
          </div>
        </div>

        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
      </form>

      <div class="mt-10">
        <h2 class="text-xl font-bold mb-2">Uploaded Entries</h2>
        <div v-for="item in uploaded" :key="item.id" class="border p-4 mb-4 rounded shadow">
          <p><strong>Title:</strong> {{ item.title }}</p>
          <p><strong>Description:</strong> {{ item.description }}</p>
          <p><strong>Date:</strong> {{ item.date }}</p>
          <div class="flex gap-2 mt-2">
            <img
              v-for="(img, idx) in item.photos"
              :key="idx"
              :src="img"
              class="w-20 h-20 object-cover rounded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'

const form = reactive({
  title: '',
  description: '',
  date: '',
})

const uploadedPhotos = ref<{ url: string | null; progress: number }[]>([])
const uploaded = ref([])
const photoPaths = ref<string[]>([])

function handlePhotos(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  for (const file of files) {
    const entry = { url: null, progress: 0 }
    uploadedPhotos.value.push(entry)
    uploadPhoto(file, entry)
  }
}

async function uploadPhoto(file: File, entry: { url: string | null; progress: number }) {
  const formData = new FormData()
  formData.append('photo', file)

  await axios.post('http://localhost:8000/api/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress(e) {
      entry.progress = Math.round((e.loaded * 100) / e.total)
    },
  }).then(response => {
    entry.url = response.data.url
    photoPaths.value.push(response.data.path) // store relative path for submission
  })
}

async function handleSubmit() {
  const body = {
    ...form,
    photos: photoPaths.value,
  }

  await $fetch('http://localhost:8000/api/entries', {
    method: 'POST',
    body,
  })

  await fetchUploaded()

  Object.assign(form, { title: '', description: '', date: '' })
  uploadedPhotos.value = []
  photoPaths.value = []
}

async function fetchUploaded() {
  const data = await $fetch('http://localhost:8000/api/entries')
  uploaded.value = data
}

onMounted(fetchUploaded)
</script>

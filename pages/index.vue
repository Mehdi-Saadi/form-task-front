<template>
  <div class=" min-w-screen min-h-screen flex items-center justify-center">
    <div class="max-w-[360px] px-4 border border-gray-300 rounded-xl p-4 space-y-6">
      <header class="flex items-center justify-center relative">
        <h1 class="text-neutral-800 font-medium text-base">اطلاعات مدارک پزشکی</h1>

        <IconsArrowRight class="text-neutral-800 absolute right-0" />
      </header>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block font-semibold">Title</label>
          <input v-model="form.title" type="text" class="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label class="block font-semibold">Description</label>
          <textarea v-model="form.description" class="w-full border px-3 py-2 rounded"></textarea>
        </div>

        <div>
          <label class="block font-semibold">Date</label>
          <input v-model="form.date" type="date" class="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label class="block font-semibold">Photos</label>
          <input type="file" multiple @change="handlePhotos" class="w-full border px-3 py-2 rounded" />
          <div class="flex flex-wrap gap-2 mt-2">
            <img
              v-for="(img, idx) in photoPreviews"
              :key="idx"
              :src="img"
              class="w-20 h-20 object-cover rounded"
            />
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
const form = reactive({
  title: '',
  description: '',
  date: '',
  photos: [] as File[],
})

const photoPreviews = ref<string[]>([])

function handlePhotos(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    form.photos = Array.from(files)
    photoPreviews.value = form.photos.map(file => URL.createObjectURL(file))
  }
}

const uploaded = ref([])

async function handleSubmit() {
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('date', form.date)
  form.photos.forEach((photo) => formData.append('photos[]', photo))

  await $fetch('http://localhost:8000/api/entries', {
    method: 'POST',
    body: formData,
  })

  await fetchUploaded()
  Object.assign(form, { title: '', description: '', date: '', photos: [] })
  photoPreviews.value = []
}

async function fetchUploaded() {
  const data = await $fetch('http://localhost:8000/api/entries')
  uploaded.value = data
}

onMounted(fetchUploaded)
</script>

<template>
  <input
    type="text"
    v-model="inputValue"
    @input="onInput"
  />
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>();

const props = defineProps<{
  modelValue: string | null
}>();

const inputValue = ref('');

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const jalali = gregorianToJalali(newVal);
    inputValue.value = toPersianDigits(jalali);
  }
}, { immediate: true });

const onInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value;
  inputValue.value = toPersianDigits(raw);

  const greg = jalaliToGregorian(inputValue.value);
  emit('update:modelValue', greg);
};
</script>

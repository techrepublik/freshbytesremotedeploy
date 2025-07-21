<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

definePageMeta({
  layout: 'home',
});

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['submit', 'close']);

const config = useRuntimeConfig();
const api = config.public.API_LINK;

const newSubCategory = ref({
  sub_category_name: '',
  sub_category_description: '',
  sub_category_image: null,
  category_id: '',
  created_at: null,
  updated_at: null
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetNewSubCategory();
  }
});

const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token');
  const token = accessTokenCookie.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function addSubCategory() {
  try {
    const formData = new FormData();
    formData.append('sub_category_name', newSubCategory.value.sub_category_name);
    formData.append('sub_category_description', newSubCategory.value.sub_category_description);
    formData.append('category_id', parseInt(newSubCategory.value.category_id));
    if (newSubCategory.value.sub_category_image) {
      formData.append('sub_category_image', newSubCategory.value.sub_category_image);
    }

    await $fetch(`${api}/api/subcategories/`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeaders(),
    });

    alert('Sub-category added successfully');
    emit('submit');
    emit('close');
    resetNewSubCategory();
  } catch (error) {
    alert('Failed to add sub-category.');
    console.error('API error:', error.data || error);
  }
}

function resetNewSubCategory() {
    newSubCategory.value = {
        sub_category_name: "",
        sub_category_description: "",
        category_id: "",
        category_image: null,
        created_at: null,
        updated_at: null
    };
}

</script>
<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">

                <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Add Sub-Category</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-1 font-medium">Sub-Category
                                Name</label>
                            <input type="text" v-model="newSubCategory.sub_category_name"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                placeholder="Type sub-category name" />
                        </div>
                        <div>
                            <label class="block text-gray-700 dark:text-gray-300">Category</label>
                            <select v-model="newSubCategory.category_id"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 text-gray-700 dark:text-gray-300 resize-none">
                                <option disabled value="">Select Category</option>
                                <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                                    {{ cat.category_name }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 font-medium">Sub-Category Description</label>
                            <textarea v-model="newSubCategory.sub_category_description"
                                class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none"
                                rows="3" placeholder="Write product description here"></textarea>
                        </div>
                    </div>

                    <div>
                        <label class="block mb-1 font-medium">Category Image</label>
                        <div
                            class="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" stroke-width="2"
                                viewBox="0 0 24 24">
                                <path d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="font-semibold">Click to upload</span> or
                            drag and drop
                            <div class="text-xs mt-1">SVG, PNG, JPG or GIF (MAX.
                                800×400px)</div>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-2 mt-6">
                        <button type="button" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            @click="addSubCategory">Add
                            subcategory</button>
                        <button type="button"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"   @click="$emit('close')">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        show: {
            type: Boolean,
            required: true
        },
    })
    const emit = defineEmits(['close', 'success'])

    const loading = ref(false)
    const form = ref({
        seller_name: '',
        first_name: '',
        last_name: '',
        seller_email: '',
        seller_password: '',
        seller_phone: '',
        seller_address: '',
        avatar: null,
    })
    const avatarPreview = ref(null)

    watch(() => props.show, (val) => {
        if (val) {
            Object.assign(form.value, {
            seller_name: '',
            first_name: '',
            last_name: '',
            seller_email: '',
            seller_password: '',
            seller_phone: '',
            seller_address: '',
            avatar: null,
            })
            avatarPreview.value = null
        }
    })

    function onAvatarChange(e) {
        const file = e.target.files[0]
        form.value.avatar = file
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => {
            avatarPreview.value = ev.target.result
            }
            reader.readAsDataURL(file)
        } else {
            avatarPreview.value = null
        }
    }

    async function submit() {
        loading.value = true
        try {
            const formData = new FormData()
            for (const key in form.value) {
            if (form.value[key]) {
                formData.append(key, form.value[key])
            }
            }
            await $fetch(`${props.api}/sellers/`, {
            method: 'POST',
            body: formData,
            })
            emit('success')
            emit('close')
        } catch (err) {
            alert('Failed to add seller')
        } finally {
            loading.value = false
        }
    }

</script>

<template>
<!-- Add Seller Modal -->
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-xl p-8 relative">
      <button
        @click="$emit('close')"
        type="button"
        class="absolute top-7 right-8 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      <h2 class="text-xl font-semibold mb-4">Add Seller</h2>
      <form @submit.prevent="submit" class="space-y-3">
        <div>
          <label class="block font-medium mb-1">Seller name</label>
          <input v-model="form.seller_name" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="Type seller name" />
        </div>
        <div class="flex gap-2">
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">First Name</label>
            <input v-model="form.first_name" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="First Name" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium mb-1">Last Name</label>
            <input v-model="form.last_name" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="Last Name" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="form.seller_email" type="email" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="Email" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input v-model="form.seller_password" type="password" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="Password" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Phone Number</label>
          <input v-model="form.seller_phone" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="Phone Number" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Home Address</label>
          <input v-model="form.seller_address" required class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" placeholder="Home Address" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Avatar</label>
          <input type="file" accept="image/*" @change="handleAvatarChange" class="w-full" />
          <div v-if="avatarPreview" class="mt-2">
            <img :src="avatarPreview" alt="Avatar Preview" class="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
            <button
                @click="$emit('close')"
                type="button"
                class="px-6 h-12 text-base bg-gray-200 rounded hover:bg-gray-300"
            >
                Cancel
            </button>
            <button
                type="submit"
                :disabled="loading"
                class="px-6 h-12 text-base rounded bg-green-600 text-white hover:bg-green-700"
            >
                <span v-if="loading">Saving...</span>
                <span v-else>Add Seller</span>
            </button>
        </div>
      </form>
    </div>
  </div>
  </template>

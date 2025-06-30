<script setup>
  import { ref, watch, computed } from 'vue'

  definePageMeta({
    layout: 'home',
  })

  const config = useRuntimeConfig();
  const api = config.public.API_LINK; // API HERE 
  const { data, pending, error } = await useFetch(`${api}/users/`, { server: false })

  const loading = computed(() => pending.value);

  // Filters
  const search = ref('')
  const selectedRole = ref('')
  const selectedStatus = ref('')

  // Fetch users from your API
  const users = ref([])

  watch(data, (val) => {
    if (val) {
      users.value = (Array.isArray(val) ? val : val.users || []).map(u => ({
        user_id: u.user_id,
        user_name: u.user_name,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.user_name)}`,
        user_email: u.user_email,
        role: u.is_admin ? 'Admin' : (u.is_seller ? 'Seller' : 'User'),
        status: u.is_active ? 'Active' : 'Inactive'
      }))
    }
  }, { immediate: true })

  // Edit and Delete handlers (implement as needed)
  function editUser(user) {
    // Your edit logic here
    alert('Edit user: ' + user.user_id)
  }
  function deleteUser(user) {
    // Your delete logic here
    alert('Delete user: ' + user.user_id)
  }
</script>

<template>
  <div class="bg-white w-full h-full absolute top-0 left-0 z-10 flex items-center justify-center" v-if="loading">
        
        <div role="status">
            <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span class="sr-only">Loading...</span>
        </div>

  </div>
  <nav class="flex mb-2" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <li class="inline-flex items-center">
        <NuxtLink to="/home"
          class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white">
          <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
            viewBox="0 0 20 20">
            <path
              d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
          </svg>
          Home
        </NuxtLink>
      </li>
      <li>
        <div class="flex items-center">
          <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m1 9 4-4-4-4" />
          </svg>
          <a href="#"
            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white">Users</a>
        </div>
      </li>
    </ol>
  </nav>
  <!-- Header -->
  <div class="flex justify-between items-center mt-3 mb-4">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      All Users
    </h1>
    <button
      class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
      <span class="mr-2">+</span> Add new user
    </button>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap gap-2 mb-4">
    <input v-model="search" type="text" placeholder="Search for users"
      class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64" />
    <select v-model="selectedRole" class="px-4 py-2 border border-gray-300 rounded-lg">
      <option value="">Role</option>
      <option>Admin</option>
      <option>Seller</option>
      <option>User</option>
    </select>
    <select v-model="selectedStatus" class="px-4 py-2 border border-gray-300 rounded-lg">
      <option value="">Status</option>
      <option>Active</option>
      <option>Inactive</option>
    </select>
    <!-- Remove Actions button as requested -->
  </div>

  <!-- User Table -->
  <div class="overflow-x-auto bg-white rounded-lg shadow">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar & Name</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in users" :key="user.user_id">
          <td class="px-4 py-3">{{ user.user_id }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center">
              <img :src="user.avatar" class="w-8 h-8 rounded-full mr-3" />
              <span>{{ user.user_name }}</span>
            </div>
          </td>
          <td class="px-4 py-3">{{ user.user_email }}</td>
          <td class="px-4 py-3">
            <span v-if="user.role === 'Admin'"
              class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Admin</span>
            <span v-else-if="user.role === 'Seller'"
              class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Seller</span>
            <span v-else class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">User</span>
          </td>
          <td class="px-4 py-3">
            <span v-if="user.status === 'Active'"
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
              <span class="w-2 h-2 mr-1 bg-green-500 rounded-full inline-block"></span>
              Active
            </span>
            <span v-else
              class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
              <span class="w-2 h-2 mr-1 bg-red-500 rounded-full inline-block"></span>
              Inactive
            </span>
          </td>
          <td class="px-4 py-3 flex gap-2">
            <button @click="editUser(user)"
              class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">Edit</button>
            <button @click="deleteUser(user)"
              class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
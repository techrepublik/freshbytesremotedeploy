<script setup>
    definePageMeta({
        layout: 'home',
    })

    const config = useRuntimeConfig();
    const api = config.public.API_LINK; // API HERE
    const { data, pending, error } = await useFetch(`${api}/users/`, { server: false })

    import { ref } from 'vue';

    // Filters
    const search = ref('')
    const selectedRole = ref('')
    const selectedStatus = ref('')
    const selectedType = ref('')
    const selectedRating = ref('')
    const selectedCountry = ref('')

    // Fetch users from your API
    const users = ref([])

    if (data.value) {
        users.value = (Array.isArray(data.value) ? data.value : data.value.users || []).map(u => ({
            user_id: u.user_id,
            user_name: u.user_name,
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.user_name)}`,
            user_email: u.user_email,
            role: u.is_admin ? 'Admin' : (u.is_seller ? 'Seller' : 'User'),
            status: u.is_active ? 'Active' : 'Inactive'
        }))
    }

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
    <nav class="flex mb-2" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li class="inline-flex items-center">
                <NuxtLink to="/home"
                    class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white">
                    <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                    </svg>
                    Home
                </NuxtLink>
            </li>
            <li>
                <div class="flex items-center">
                    <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
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
      <button class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
        <span class="mr-2">+</span> Add new user
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2 mb-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search for users"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
      />
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.user_id">
            <td class="px-4 py-3">{{ user.user_id }}</td>
            <td class="px-4 py-3">{{ user.user_name }}</td>
            <td class="px-4 py-3">
              <img :src="user.avatar" class="w-8 h-8 rounded-full" />
            </td>
            <td class="px-4 py-3">{{ user.user_email }}</td>
            <td class="px-4 py-3">
              <span
                v-if="user.role === 'Admin'"
                class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
              >Admin</span>
              <span
                v-else-if="user.role === 'Seller'"
                class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded"
              >Seller</span>
              <span
                v-else
                class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
              >User</span>
            </td>
            <td class="px-4 py-3">
              <span
                v-if="user.status === 'Active'"
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"
              >
                <span class="w-2 h-2 mr-1 bg-green-500 rounded-full inline-block"></span>
                Active
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full"
              >
                <span class="w-2 h-2 mr-1 bg-red-500 rounded-full inline-block"></span>
                Inactive
              </span>
            </td>
            <td class="px-4 py-3 flex gap-2">
              <button @click="editUser(user)" class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">Edit</button>
              <button @click="deleteUser(user)" class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
</template>
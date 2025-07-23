<template>
  <div class="h-screen overflow-hidden bg-gradient-to-br from-green-50 to-green-100 relative">
    <img src="@/assets/images/fruits1.png" alt="Fruits"
      class="absolute inset-0 w-full object-cover opacity-20 pointer-events-none" />

    <div class="relative z-30 w-full max-w-xl ml-40 mt-20 space-y-6">
      <div class="flex flex-col items-center space-y-2">
        <img src="@/assets/images/logos-12-12.png" alt="FreshBytes Logo" class="w-16 h-16" />
        <h1 class="font-extrabold text-4xl text-gray-800 text-center mb-6">FreshBytes Admin</h1>
      </div>

      <!-- Error Message -->
      <div v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center text-sm mb-4 max-w-md w-full">
        {{ error }}
      </div>

      <!-- Form Container -->
      <div class="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-xl space-y-6 self-start ml-8">
  <h2 class="text-2xl font-semibold text-center">Join Us</h2>
  <RegisterForm @child-action="handleRegister" :form="form" :isLoading="isLoading" />
</div>

  </div>

  <div class="absolute -bottom-45 right-0 z-0 hidden lg:block pointer-events-none">
    <img src="@/assets/images/fruits.png" alt="Fruits" class="w-[1090px] object-contain pointer-events-none" />
  </div>

  </div>
</template>

<script setup>

definePageMeta({ middleware: 'guest' })

const { register, isLoading } = useAuth()

const form = reactive({
  email: '',
  first_name: '',
  last_name: '',
  user_name: '',
  user_phone: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match"
    return
  }

  try {
    await register({
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      user_name: form.user_name,
      user_phone: form.user_phone
    })
    await navigateTo('/login')
  } catch (err) {
    error.value = err.message || 'Registration failed'
  }
}
</script>

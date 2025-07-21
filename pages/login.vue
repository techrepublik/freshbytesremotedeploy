<template>
    <div
        class="h-screen flex flex-col space-y-8 items-center justify-center bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
        <img src="@/assets/images/fruits1.png" alt="Fruits"
            class="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />

        <!-- Logo and Heading -->
        <div class="z-10 flex flex-col items-center space-y-2">
            <img src="@/assets/images/logos-12-12.png" alt="FreshBytes Logo" class="w-16 h-16" />
            <h1 class="font-extrabold text-4xl text-gray-800">FreshBytes Admin</h1>
        </div>

        <!-- Error Display -->
        <div v-if="error"
            class="z-10 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-lg max-w-md text-center">
            {{ error }}
        </div>

        <div class="relative z-10 w-full max-w-md">
            <img src="@/assets/images/fruits.png" alt="Form Background"
                class="absolute -top-6 -right-200 w-full h-full scale-400 object-contain opacity-100 pointer-events-none" />


            <!-- Auth Form -->
            <div class="align-center bg-white/90 backdrop-blur-md p-12 rounded-2xl shadow-xl">
                <h2 class="text-3xl font-semibold mb-6 text-center">Welcome Back</h2>
                <FormAuth @child-action="handleLogin" :form="form" :isLoading="isLoading" />
            </div>
            
        </div>

        <!-- Password Reset -->
        <button @click="handlePasswordReset" class="z-10 text-blue-600 hover:text-blue-800 underline text-base"
            :disabled="isLoading">
            Forgot Password?
        </button>
    </div>
</template>


<script setup>
definePageMeta({
    middleware: 'guest'
})

const { login, resetPassword, isLoading } = useAuth()

const form = reactive({
    email: '',
    password: ''
})

const error = ref('')

const handleLogin = async () => {
    error.value = ''

    try {
        await login(form)
        await navigateTo('/home') // or wherever you want to redirect
    } catch (err) {
        error.value = err.message
    }
}

const handlePasswordReset = async () => {
    if (!form.email) {
        error.value = 'Please enter your email first'
        return
    }

    try {
        await resetPassword(form.email)
        error.value = ''
        alert('Password reset instructions sent to your email!')
    } catch (err) {
        error.value = err.message
    }
}

// // Auto-fill demo credentials (remove in production)
// onMounted(() => {
//     form.email = 'admin@example.com'
//     form.password = 'admin123'
// })
</script>
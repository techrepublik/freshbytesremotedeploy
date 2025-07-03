<template>
    <div class="h-screen flex flex-col space-y-8 items-center justify-center">
        <h1 class="font-bold text-lg">Welcome to FreshBytes Admin</h1>
        
        <!-- Error display -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {{ error }}
        </div>
        
        <div class="bg-gray-100 p-8 rounded-2xl">
            <FormAuth @child-action="handleLogin" :form="form" :isLoading="isLoading"/>
        </div>
        
        <!-- Password reset option -->
        <button 
            @click="handlePasswordReset" 
            class="text-blue-500 hover:text-blue-700 underline"
            :disabled="isLoading"
        >
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
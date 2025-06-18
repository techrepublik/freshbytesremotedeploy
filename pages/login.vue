<template>
    <div class="h-screen flex flex-col space-y-8 items-center justify-center">
        <h1 class="font-bold text-lg">Welcome to FreshBytes Admin</h1>
        <div class="bg-gray-100 p-8 rounded-2xl"><FormAuth @child-action="handleLogin" :form="form"/></div>
        <div></div>
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

    const handleLogin = async (data) => {
        error.value = ''

        try {
            await login(form)
            await navigateTo('/home')
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
            alert('Password reset! Check console for new password.')
        } catch (err) {
            error.value = err.message
        }
    }

    // Auto-fill demo credentials
    onMounted(() => {
        form.email = 'admin@example.com'
        form.password = 'admin123'
    })

</script>
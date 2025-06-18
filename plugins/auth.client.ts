export default defineNuxtPlugin(async () => {
    const { checkAuth } = useAuth()
    
    // Check if user is already authenticated on app start
    await checkAuth()
})
export default defineNuxtRouteMiddleware(async () => {
    const { isLoggedIn, checkAuth } = useAuth()
    
    // Check authentication status
    await checkAuth()
    
    if (isLoggedIn.value) {
        return navigateTo('/home')
    }
})
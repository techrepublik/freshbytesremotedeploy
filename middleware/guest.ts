export default defineNuxtRouteMiddleware(async () => {
    const { isLoggedIn } = useAuth()
    
    if (isLoggedIn.value) {
        return navigateTo('/home')
    }
})
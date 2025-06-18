export default defineNuxtRouteMiddleware((to, from) => {
    // Add your authentication logic here
    const isAuthenticated = true // Your auth check
    
    if (!isAuthenticated) {
        return navigateTo('/login')
    } else {
        return navigateTo('/home')
    }
})
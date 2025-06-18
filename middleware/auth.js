export default defineNuxtRouteMiddleware(async (to, from) => {
    // Add your authentication logic here
    // const isAuthenticated = true // Your auth check
    
    // if (!isAuthenticated) {
    //     return navigateTo('/login')
    // } else {
    //     return navigateTo('/home')
    // }

    const { isLoggedIn, checkAuth } = useAuth()

    await checkAuth()

    if (!isLoggedIn.value) {
        return navigateTo('/login')
    } else {
        return navigateTo('/home')
    }
})
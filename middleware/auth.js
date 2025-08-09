export default defineNuxtRouteMiddleware((to, from) => {
  const { accessToken } = useAuth()
  
  // If no token, redirect to login
  if (!accessToken.value) {
    return navigateTo('/login')
  }
  
  // If user is on login page but has token, redirect to home
  if (to.path === '/login' && accessToken.value) {
    return navigateTo('/home')
  }
  
  // Otherwise, allow the navigation to proceed
})
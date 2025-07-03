export default defineNuxtRouteMiddleware((to, from) => {
  const { token } = useAuth()
  
  if (!token.value) {
    return navigateTo('/login')
    } else {
        return navigateTo('/home')
    }
})
export default defineNuxtPlugin(() => {
  $fetch.create({
    onRequest({ request, options }) {
      const { token } = useAuth()
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Token expired or invalid
        const { logout } = useAuth()
        logout()
      }
    }
  })
})
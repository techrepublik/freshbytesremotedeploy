export default defineNuxtPlugin(async () => {
  const { accessToken, refreshToken, setAccessToken, setRefreshToken, setUser } = useAuth()
  const config = useRuntimeConfig()
  const apiBase = config.public.API_LINK
  const accessTokenCookie = useCookie('auth-access-token')
  const refreshTokenCookie = useCookie('auth-refresh-token')
  
  // Restore tokens from cookies if they exist
  if (accessTokenCookie.value && !accessToken.value) {
    setAccessToken(accessTokenCookie.value)
  }
  
  if (refreshTokenCookie.value && !refreshToken.value) {
    setRefreshToken(refreshTokenCookie.value)
  }
  
  // If we have an access token, try to get current user data
  if (accessToken.value) {
    try {
      // Use the correct endpoint for current user data
      const userData = await $fetch(`${apiBase}/api/users/`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`
        }
      })
      setUser(userData)
    } catch (error) {
      console.log('Initial user fetch failed, trying to refresh token...')
      
      // Access token might be expired, try to refresh
      if (refreshToken.value) {
        try {
          const { refreshAccessToken } = useAuth()
          await refreshAccessToken()
          
          // Try again with new token
          const userData = await $fetch(`${apiBase}/api/users/`, {
            headers: {
              Authorization: `Bearer ${accessToken.value}`
            }
          })
          setUser(userData)
        } catch (refreshError) {
          console.log('Token refresh failed, clearing auth state')
          // Both tokens are invalid, clear them
          accessTokenCookie.value = null
          refreshTokenCookie.value = null
          setAccessToken(null)
          setRefreshToken(null)
          setUser(null)
        }
      } else {
        // No refresh token, clear access token
        accessTokenCookie.value = null
        setAccessToken(null)
        setUser(null)
      }
    }
  }
})
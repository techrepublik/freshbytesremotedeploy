// Define types for API responses
interface LoginResponse {
  access: string
  refresh: string
  user?: {
    id: number
    email: string
    name: string
    role: string
  }
}

interface UserResponse {
  id: number
  email: string
  name: string
  role: string
}

interface ResetPasswordResponse {
  data: {
    message: string
  }
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.API_LINK
  const user = useState<null | { id: number; email: string; name: string; role: string }>('auth.user', () => null)
  const accessToken = useState<string | null>('auth.accessToken', () => null)
  const refreshToken = useState<string | null>('auth.refreshToken', () => null)
  const isLoading = ref(false)

  // Internal setters for plugins
  const setAccessToken = (newToken: string | null) => {
    accessToken.value = newToken
  }

  const setRefreshToken = (newToken: string | null) => {
    refreshToken.value = newToken
  }

  const setUser = (newUser: any) => {
    user.value = newUser
  }

  const login = async (credentials: { email: string; password: string }) => {
    isLoading.value = true
    try {
      console.log('Sending login request:', credentials) // Debug log

      const response = await $fetch<LoginResponse>(`${apiBase}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          user_email: credentials.email,
          password: credentials.password
        }
      })

      console.log('Login response:', response) // Debug log

      // Store tokens
      accessToken.value = response.access
      refreshToken.value = response.refresh

      // If user data is included in response, store it
      if (response.user) {
        user.value = response.user
      } else {
        // Fetch user data using the access token
        try {
          const userData = await $fetch<UserResponse>(`${apiBase}/api/users/`, {
            headers: {
              Authorization: `Bearer ${response.access}`
            }
          })
          user.value = userData
        } catch (userError) {
          console.error('Failed to fetch user data:', userError)
        }
      }

      // Set tokens in cookies for persistence
      const accessTokenCookie = useCookie('auth-access-token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 15 // 15 minutes for access token
      })

      const refreshTokenCookie = useCookie('auth-refresh-token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days for refresh token
      })

      accessTokenCookie.value = response.access
      refreshTokenCookie.value = response.refresh

      return response
    } catch (error: any) {
      console.error('Login error:', error) // Debug log
      throw new Error(error.data?.detail || error.data?.message || 'Login failed')
    } finally {
      isLoading.value = false
    }
  }

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await $fetch<{ access: string }>(`${apiBase}/api/auth/login/refresh/`, {
        method: 'POST',
        body: {
          refresh: refreshToken.value
        }
      })

      accessToken.value = response.access

      const accessTokenCookie = useCookie('auth-access-token')
      accessTokenCookie.value = response.access

      return response.access
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, logout user
      await logout()
      throw error
    }
  }

  const logout = async () => {
    try {
      if (refreshToken.value) {
        await $fetch(`${apiBase}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          },
          body: {
            refresh: refreshToken.value
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state regardless of API call success
      accessToken.value = null
      refreshToken.value = null
      user.value = null

      const accessTokenCookie = useCookie('auth-access-token')
      const refreshTokenCookie = useCookie('auth-refresh-token')
      accessTokenCookie.value = null
      refreshTokenCookie.value = null

      await navigateTo('/login')
    }
  }

  const resetPassword = async (email: string) => {
    const response = await $fetch<ResetPasswordResponse>(`${apiBase}/api/auth/reset-password/`, {
      method: 'POST',
      body: {
        user_email: email
      }
    })
    return response.data
  }

  const isLoggedIn = computed(() => !!user.value && !!accessToken.value)
  const register = async ({
    email,
    password,
    first_name,
    last_name,
    user_name,
    user_phone
  }: {
    email: string
    password: string
    first_name: string
    last_name: string
    user_name: string
    user_phone: string
  }) => {
    isLoading.value = true

    try {
      await $fetch(`${apiBase}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          user_email: email,
          password,
          first_name,
          last_name,
          user_name,
          user_phone
        },
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.data?.detail || error.data?.message || 'Registration failed')
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: readonly(user),
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    isLoading: readonly(isLoading),
    isLoggedIn,
    login,
    logout,
    resetPassword,
    refreshAccessToken,
    // 🆕 Add this:
    register,
    // Internal setters (use cautiously)
    setAccessToken,
    setRefreshToken,
    setUser
  }
}
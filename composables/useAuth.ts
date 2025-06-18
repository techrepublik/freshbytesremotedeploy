// composables/useAuth.ts
export const useAuth = () => {
    const user = ref<null | { id: number; email: string; name: string; role: string }>(null)
    const isLoggedIn = computed(() => !!user.value)
    const isLoading = ref(false)

    // Mock user database
    const mockUsers = [
        { id: 1, email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
        { id: 2, email: 'user@example.com', password: 'user123', name: 'Regular User', role: 'user' },
        { id: 3, email: 'john@example.com', password: 'password', name: 'John Doe', role: 'user' }
    ]

    // Simulate API delay
    const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

    // Mock login function
    const login = async (credentials: { email: string; password: string }) => {
        isLoading.value = true
        
        try {
        // Simulate network delay
        await simulateDelay(1500)
        
        // Find user in mock database
        const foundUser = mockUsers.find(u => 
            u.email === credentials.email && u.password === credentials.password
        )
        
        if (!foundUser) {
            throw new Error('Invalid email or password')
        }

        // Create mock JWT token (just base64 encoded user data)
        const mockToken = btoa(JSON.stringify({
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }))

        // Store in cookie (simulate secure storage)
        const authCookie = useCookie<string | null>('auth-token', {
            default: () => null,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            secure: true,
            sameSite: 'strict'
        })
        authCookie.value = mockToken

        // Set user state
        user.value = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role
        }

        console.log('✅ Mock login successful:', user.value)
        return { success: true, user: user.value }

        } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Mock login failed:', error.message)
        } else {
            console.error('❌ Mock login failed:', error)
        }
        throw error
        } finally {
        isLoading.value = false
        }
    }

    // Mock logout function
    const logout = async () => {
        isLoading.value = true
        
        try {
        // Simulate network delay
        await simulateDelay(500)
        
        // Clear cookie
        const authCookie = useCookie('auth-token')
        authCookie.value = null
        
        // Clear user state
        user.value = null
        
        console.log('✅ Mock logout successful')
        await navigateTo('/login')
        
        } catch (error) {
        console.error('❌ Mock logout failed:', error)
        } finally {
        isLoading.value = false
        }
    }

    // Mock register function
    const register = async (userData: { name: string; email: string; password: string }) => {
        isLoading.value = true
        
        try {
        await simulateDelay(2000)
        
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === userData.email)
        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        // Create new user
        const newUser = {
            id: mockUsers.length + 1,
            email: userData.email,
            password: userData.password,
            name: userData.name,
            role: 'user'
        }
        
        // Add to mock database (in real app, this would be API call)
        mockUsers.push(newUser)
        
        console.log('✅ Mock registration successful:', newUser)
        
        // Auto login after registration
        await login({ email: userData.email, password: userData.password })
        
        return { success: true, user: user.value }
        
        } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Mock registration failed:', error.message)
        } else {
            console.error('❌ Mock registration failed:', error)
        }
        throw error
        } finally {
        isLoading.value = false
        }
    }

    // Check if stored token is valid
    const checkAuth = async () => {
        const authCookie = useCookie('auth-token')
        
        if (!authCookie.value) {
        user.value = null
        return false
        }

        try {
            // Decode mock token
            const decoded = JSON.parse(atob(authCookie.value))
            
            // Check if token is expired
            if (Date.now() > decoded.exp) {
                authCookie.value = null
                user.value = null
                console.log('🔒 Mock token expired')
                return false
            }

            // Set user from token
            user.value = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role
            }
            
            console.log('✅ Mock auth check successful:', user.value)
            return true
        
        } catch (error) {
            console.error('❌ Mock auth check failed:', error)
            authCookie.value = null
            user.value = null
            return false
        }
    }

    // Mock password reset
    const resetPassword = async (email: string) => {
        isLoading.value = true
        
        try {
        await simulateDelay(1000)
        
        const foundUser = mockUsers.find(u => u.email === email)
        if (!foundUser) {
            throw new Error('No user found with this email')
        }
        
        console.log('✅ Mock password reset email sent to:', email)
        console.log('🔑 New mock password: newpassword123')
        
        // In simulation, just change the password
        foundUser.password = 'newpassword123'
        
        return { success: true, message: 'Password reset email sent' }
        
        } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Mock password reset failed:', error.message)
        } else {
            console.error('❌ Mock password reset failed:', error)
        }
        throw error
        } finally {
        isLoading.value = false
        }
    }

    // Mock function to get current user profile
    const getProfile = async () => {
        if (!user.value) {
        throw new Error('Not authenticated')
        }
        
        isLoading.value = true
        
        try {
        await simulateDelay(800)
        
        // Simulate fetching additional user data
        const fullProfile = {
            ...user.value,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value.name)}&background=6366f1&color=fff`,
            joinedAt: '2024-01-15',
            lastLogin: new Date().toISOString(),
            preferences: {
            theme: 'light',
            notifications: true
            }
        }
        
        console.log('✅ Mock profile fetch successful:', fullProfile)
        return fullProfile
        
        } catch (error) {
        console.error('❌ Mock profile fetch failed:', error)
        throw error
        } finally {
        isLoading.value = false
        }
    }

    return {
        // State
        user: readonly(user),
        isLoggedIn,
        isLoading: readonly(isLoading),
        
        // Actions
        login,
        logout,
        register,
        checkAuth,
        resetPassword,
        getProfile,
        
        // Mock utilities (remove in production)
        mockUsers: readonly(ref(mockUsers))
    }
}
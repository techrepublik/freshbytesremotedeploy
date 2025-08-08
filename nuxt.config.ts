import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/eslint'],
  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  },
  app: {
    head: {
      htmlAttrs: {
        'data-theme': 'light',
        class: 'light'
      },
      meta: [
        { name: 'color-scheme', content: 'light only' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      API_LINK: "http://5.104.84.97:8002"
      // API_LINK: process.env.NUXT_PUBLIC_API_LINK
    }
  },

})
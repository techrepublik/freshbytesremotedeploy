<script setup>
    definePageMeta({
    layout: 'home',
    })

    const config = useRuntimeConfig()
    const api = config.public.API_LINK
    console.log(api);
    

    const { data: products } = await useFetch(`${api}/products/`)
</script>

<template>
        <h1>Home</h1>
        <p v-for="p in products">{{ p.product_name }}</p>
</template>
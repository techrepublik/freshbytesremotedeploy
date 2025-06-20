<script setup>
    definePageMeta({
    layout: 'home',
    })

    const api = process.env.API_LINK

    const { data: products } = await useFetch("http://192.168.63.238:8000/products/")
</script>

<template>
        <h1>Home</h1>
        <p v-for="p in products">{{ p.product_name }}</p>
</template>
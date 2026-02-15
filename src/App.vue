<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

const auth = useAuth()
onMounted(() => auth.init())
</script>

<template>
  <router-view />
</template>

<style>
/* グローバルスタイルは src/style.css で */
</style>

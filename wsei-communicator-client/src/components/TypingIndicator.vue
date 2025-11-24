<script setup lang="ts">
// No props or logic needed - just a visual indicator
</script>

<template>
  <div class="flex justify-start">
    <div class="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
      <div class="flex space-x-1 items-center h-6">
        <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0s;"></div>
        <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
        <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}
</style>

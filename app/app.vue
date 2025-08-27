<script setup lang="ts">
import CanvasComponent from "~/components/scene/CanvasComponent.vue";
</script>

<template>
  <client-only>
    <CanvasComponent />
  </client-only>
</template>
<style>
body {
  margin: 0;
  padding: 0;
}
</style>
<template>
  <div>counter: {{counter}}</div>
  <button @click="increment">Increment</button>
</template>

<script>

import { ref } from 'vue';

export default {
  setup() {
    const counter = ref(0);

    return {
      counter,
      increment() {
        counter.value++
      }
    }
  }
}
</script>

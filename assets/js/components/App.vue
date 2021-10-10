<template>
  <div>counter: {{counter}}</div>
  <button @click="increment">Increment</button>

  <div class="rounded-md p-4 bg-rose-500">
    WTF
  </div>


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

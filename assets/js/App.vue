<template>
  <div class="h-full bg-blue-50">
    <div class="flex-grow h-full">
      <data-view></data-view>
    </div>
    <div class="flex-none w-64 h-full absolute top-0 right-0 bg-gray-200 bg-opacity-25">
      <filters></filters>
    </div>
  </div>
</template>

<script>

import { ref } from 'vue';
import DataView from "./components/DataView.vue";
import Filters from "./components/Filters.vue";

export default {
  components: {Filters, DataView},
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

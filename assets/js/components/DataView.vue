<template>
  <div class="h-full" id="appDataView"></div>
</template>

<script>

import { viewer } from "../viewer/Viewer";
import { ref, onMounted } from 'vue';
const val = ref(2);

export default {
  setup() {

    onMounted(() => {
      viewer.attachToContainer(document.getElementById('appDataView'));
    })

    return {
      val
    };
  }
}
</script>

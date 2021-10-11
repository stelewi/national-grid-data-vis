<template>
  <h1>Viewer {{ val }}</h1>
  <div class="h-full" id="appDataView">

  </div>

</template>

<script>

import Viewer from "../viewer/Viewer";
import { ref, onMounted } from 'vue';

let viewer = null;
const val = ref(2);

export default {
  setup() {

    onMounted(() => {
      viewer = new Viewer();
      viewer.attachToContainer(document.getElementById('appDataView'));
    })

    return {
      val
    };
  }
}
</script>

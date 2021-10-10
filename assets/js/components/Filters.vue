<template>
  <h1>Filters</h1>
  <button class="btn btn-blue" @click.prevent="refreshData()">Fetch Data...</button>

  <ul>
    <li v-for="type in types">
      {{ type.name }}
    </li>
  </ul>

</template>

<script>
import { refreshData, types } from "../store/DataStore";

export default {
  setup() {

    return {
      refreshData,
      types
    }
  },
  mounted() {


  }
}


</script>

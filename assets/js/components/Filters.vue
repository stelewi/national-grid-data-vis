<template>
  <div class="p-4 text-gray-600">
    <h1>Filters</h1>
    <input class="border my-2 py-2 px-3 text-red" name="from" id="filters_from" type="datetime-local" v-model="filters.from"/>
    <input class="border my-2 py-2 px-3 text-gray" name="to" id="filters_to" type="datetime-local" v-model="filters.to"/>

    <ul>
      <li v-for="type in types">
        <label class="filter-label">
          <input type="checkbox" v-model="type.show" @change="refreshViewer()" class="mr-2">
          {{ type.label }}
        </label>

      </li>
    </ul>

    <button class="btn btn-blue my-2" @click.prevent="update()">Refresh</button>

  </div>

</template>

<script>
import { refreshData, types, filters } from "../store/DataStore";
import { viewer } from "../viewer/Viewer";

export default {
  setup() {

    const update = () => {
      refreshData(() => {
        viewer.refresh();
      });
    };

    const refreshViewer = () => {
      viewer.refresh();
    };

    return {
      filters,
      update,
      types,
      refreshViewer
    }
  }
}
</script>

<style scoped>

label.filter-label:hover {
  cursor: pointer;
}

</style>

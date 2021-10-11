<template>
  <div class="p-4 text-gray-600">
    <h1>Filters</h1>
    <input class="border my-2 py-2 px-3 text-red" name="from" id="filters_from" type="datetime-local" v-model="filters.from"/>
    <input class="border my-2 py-2 px-3 text-gray" name="to" id="filters_to" type="datetime-local" v-model="filters.to"/>

    <ul>
      <li v-for="type in types">
        <input type="checkbox" :checked="typeIsVisible(type.id)" class="mr-3">{{ type.label }}
      </li>
    </ul>

    <button class="btn btn-blue" @click.prevent="update()">Refresh</button>

  </div>

</template>

<script>
import { refreshData, types, filters } from "../store/DataStore";
import { viewer } from "../viewer/Viewer";

export default {
  setup() {

    const update = () => {
      refreshData(() => {
        viewer.refreshFromData();
      });
    };

    const typeIsVisible = (typeId) => {

      return true;
    }

    return {

      filters,
      update,
      types,
      typeIsVisible
    }
  }
}
</script>

import axios from "axios";
import { ref, reactive } from 'vue';

const data = ref(null);
const types = ref([]);
const loading = ref(false);

async function loadTypes() {

    loading.value = true;
    axios
        .get('/data/types').then((response) => {

        types.value = response.data;
    })
        .catch((error) => {

        })
        .then(() => {
            loading.value = false;
        });
}

async function refreshData() {

    loading.value = true;
    axios
        .get('/data').then((response) => {

            data.value = response.data;
        })
        .catch((error) => {

        })
        .then(() => {
            loading.value = false;
        });
}

loadTypes();

export {
    loadTypes,
    refreshData,
    types,
    data
}




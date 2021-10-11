import axios from "axios";
import { ref, reactive } from 'vue';
import moment from "moment";

const filters = reactive({
    from: moment().subtract(1, 'days').format(moment.HTML5_FMT.DATETIME_LOCAL),
    to: moment().format(moment.HTML5_FMT.DATETIME_LOCAL)
});

const data = ref([]);
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

async function refreshData(cb) {

    loading.value = true;
    axios
        .get('/data/gen-by-type',
            { params: {
                from: moment(filters.from, moment.HTML5_FMT.DATETIME_LOCAL).format(),
                to: moment(filters.to, moment.HTML5_FMT.DATETIME_LOCAL).format()
            }}
            )
            .then((response) => {

                data.value = response.data;
            })
            .catch((error) => {

            })
            .then(() => {
                loading.value = false;
                cb();
            });
}

loadTypes();

export {
    filters,
    loadTypes,
    refreshData,
    types,
    data
}




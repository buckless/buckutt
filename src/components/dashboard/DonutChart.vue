<script>
import { Doughnut, mixins } from 'vue-chartjs';
import { parsePrice } from '../../lib/price';

export default {
    extends: Doughnut,

    mixins: [mixins.reactiveProp],

    props: {
        chartData: Object,
        unit: String
    },

    mounted() {
        this.renderChart(this.chartData, this.options);
    },

    computed: {
        options() {
            return {
                maintainAspectRatio: false,
                responsive: true,
                tooltips: {
                    callbacks: {
                        label: (value, data) =>
                            this.unit === 'amount'
                                ? `${data.labels[value.index]}: ${parsePrice(
                                      data.datasets[value.datasetIndex].data[value.index]
                                  )}`
                                : `${data.labels[value.index]}: ${
                                      data.datasets[value.datasetIndex].data[value.index]
                                  }`
                    }
                }
            };
        }
    }
};
</script>

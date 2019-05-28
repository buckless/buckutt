<script>
import { Line, mixins } from 'vue-chartjs';
import { parsePrice } from '../../lib/price';

export default {
    extends: Line,

    mixins: [mixins.reactiveProp],

    props: {
        chartData: Object,
        unit: String,
        additive: Boolean
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
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: value =>
                            this.unit === 'amount' ? parsePrice(value.yLabel) : value.yLabel
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [
                        {
                            display: true,
                            type: 'time',
                            time: {
                                tooltipFormat: 'D MMMM YYYY HH:mm',
                                displayFormats: {
                                    millisecond: 'HH:mm:ss.SSS',
                                    second: 'HH:mm:ss',
                                    minute: 'HH:mm',
                                    hour: 'D MMM HH:mm',
                                    day: 'D MMM',
                                    week: 'D MMM YYYY',
                                    month: 'MMM YYYY',
                                    quarter: 'MMM YYYY'
                                }
                            },
                            scaleLabel: {
                                display: false,
                                labelString: 'Date'
                            },
                            ticks: {
                                maxRotation: 0
                            }
                        }
                    ],
                    yAxes: [
                        {
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Quantité'
                            },
                            ticks: {
                                beginAtZero: !this.additive,
                                maxTicksLimit: 10,
                                stepSize: 1,
                                callback: value => (this.unit === 'amount' ? `${value} €` : value)
                            }
                        }
                    ]
                }
            };
        }
    }
};
</script>

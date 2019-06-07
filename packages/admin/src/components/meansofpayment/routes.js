import MeansOfPayment from './MeansOfPayment.vue';
import MeansOfPaymentCreate from './MeansOfPaymentCreate.vue';
import MeansOfPaymentList from './MeansOfPaymentList.vue';

import MeanOfPaymentShow from './meanofpayment/MeanOfPaymentShow.vue';
import MeanOfPaymentShowDetails from './meanofpayment/MeanOfPaymentShowDetails.vue';
import MeanOfPaymentEditObject from './meanofpayment/MeanOfPaymentEditObject.vue';

export default [
    {
        path: '/meansofpayment',
        component: MeansOfPayment,
        children: [
            { path: '', component: MeansOfPaymentList },
            { path: 'create', component: MeansOfPaymentCreate }
        ]
    },
    {
        path: '/meansofpayment/:meanofpayment',
        component: MeanOfPaymentShow,
        children: [
            { path: '', component: MeanOfPaymentShowDetails },
            { path: 'edit', component: MeanOfPaymentEditObject }
        ]
    }
];

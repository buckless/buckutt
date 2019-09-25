import { saveAs } from 'file-saver';
import { get, download } from '@/lib/fetch';
import treasuryQueryString from '@/lib/treasuryQueryString';

export const getTreasury = async ({ commit, dispatch }, fields) => {
    const qString = treasuryQueryString(fields);

    const purchases = await get(`stats/purchases?${qString}`);
    const withdrawals = await get(`stats/withdrawals?${qString}`);
    const reloads = await get(`stats/reloads?${qString}`);
    const refunds = await get(`stats/refunds?${qString}`);

    commit('CLEAROBJECT', 'purchases');
    commit('CLEAROBJECT', 'withdrawals');
    commit('CLEAROBJECT', 'reloads');
    commit('CLEAROBJECT', 'refunds');

    dispatch('normalizeAndSet', { route: 'purchases', results: purchases });
    dispatch('normalizeAndSet', { route: 'withdrawals', results: withdrawals });
    dispatch('normalizeAndSet', { route: 'reloads', results: reloads });
    dispatch('normalizeAndSet', { route: 'refunds', results: refunds });
};

export const downloadTreasury = async (_, { fields, route }) => {
    const qString = treasuryQueryString(fields);
    const currentTime = Math.floor(Date.now() / 1000);

    const data = await download(`stats/${route}/csv?${qString}`);
    saveAs(data, `treasury-${route}-${currentTime}.csv`);
};

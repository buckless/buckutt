import alerts from './components/alerts/routes';
import articles from './components/articles/routes';
import dashboard from './components/dashboard/routes';
import devices from './components/devices/routes';
import events from './components/events/routes';
import home from './components/home/routes';
import logout from './components/logout/routes';
import points from './components/points/routes';
import promotions from './components/promotions/routes';
import treasury from './components/treasury/routes';
import users from './components/users/routes';
import wallets from './components/wallets/routes';

export default [].concat(
    alerts,
    articles,
    dashboard,
    devices,
    events,
    home,
    logout,
    points,
    promotions,
    treasury,
    users,
    wallets
);

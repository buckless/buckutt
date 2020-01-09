import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { loadLang } from '../storage';
import fr from './fr';
import en from './en';

Vue.use(VueI18n);

const dateTimeFormats = {
    fr: {
        short: {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        },

        long: {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric'
        }
    },

    en: {
        short: {
            day: 'numeric',
            month: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        },

        long: {
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }
    }
};

export const i18n = new VueI18n({
    locale: loadLang(),
    fallbackLocale: 'en',
    messages: { fr, en },
    dateTimeFormats
});

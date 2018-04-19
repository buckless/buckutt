<template>
    <div class="b-home">
        <div class="mdc-card">
            <section class="b-home__tabs">
                <div class="b-home__tabs__tab" :class="tabConnect" @click="changeTab('connect')">Connexion</div>
                <div class="b-home__tabs__tab" :class="tabRegister" @click="changeTab('register')">Inscription</div>
            </section>
            <form @submit.prevent="log(lmail, pin)" v-show="tab === 'connect'">
                <section class="mdc-card__supporting-text">
                    <label class="mdc-text-field" ref="lmail">
                        <input type="text" class="mdc-text-field__input" autofocus required v-model="lmail">
                        <span class="mdc-text-field__label">Mail ou nom d'utilisateur</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <label class="mdc-text-field" ref="pin">
                        <input type="password" class="mdc-text-field__input" required minlength="4" v-model="pin">
                        <span class="mdc-text-field__label">Code PIN</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions">
                    <button type="submit" class="mdc-button mdc-button--raised" :disabled="working">Connexion</button>
                    <div class="b-space"></div>
                    <router-link tag="button" to="/forgot-pin" class="mdc-button">
                        PIN oublié
                    </router-link>
                </section>
            </form>
            <div class="b-home__register-chooser" v-show="tab === 'register'">
                <button
                    type="submit"
                    class="mdc-button mdc-button--raised"
                    @click="changeTab('register-ticket')">J'ai déjà un billet</button>
                <button
                    type="submit"
                    class="mdc-button mdc-button--stroked"
                    @click="changeTab('register-full')">Je n'ai pas de billet</button>
            </div>
            <form @submit.prevent="sendAssign(ticketNumber)" v-show="tab === 'register-ticket'">
                <section class="mdc-card__supporting-text">
                    <label class="mdc-text-field" ref="ticketNumber">
                        <input type="text" class="mdc-text-field__input" v-model="ticketNumber">
                        <span class="mdc-text-field__label">Numéro de billet</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                </section>
                <section class="mdc-card__actions">
                    <button type="submit" class="mdc-button mdc-button--raised" :disabled="working">Inscription</button>
                    <div class="b-space"></div>
                    <button type="button" class="mdc-button" :disabled="working" @click="changeTab('register')">Retour</button>
                </section>
            </form>
            <form @submit.prevent="sendRegister(firstname, lastname, rmail, cgu)" v-show="tab === 'register-full'">
                <section class="mdc-card__supporting-text">
                    <label class="mdc-text-field" ref="firstname">
                        <input type="text" class="mdc-text-field__input" required v-model="firstname">
                        <span class="mdc-text-field__label">Prénom</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <label class="mdc-text-field" ref="lastname">
                        <input type="text" class="mdc-text-field__input" required v-model="lastname">
                        <span class="mdc-text-field__label">Nom</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <label class="mdc-text-field" ref="rmail">
                        <input type="email" class="mdc-text-field__input" required v-model="rmail">
                        <span class="mdc-text-field__label">Mail</span>
                        <div class="mdc-text-field__bottom-line"></div>
                    </label>
                    <b-checkbox id="cgu" v-model="cgu">
                        J'accepte les <a target="_blank" href="https://buckless.com/static/cgu.pdf">conditions générales d'utilisation</a>.
                    </b-checkbox>
                </section>
                <section class="mdc-card__actions">
                    <button type="submit" class="mdc-button mdc-button--raised" :disabled="working">Inscription</button>
                    <div class="b-space"></div>
                    <button type="button" class="mdc-button" :disabled="working" @click="changeTab('register')">Retour</button>
                </section>
            </form>
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapState, mapActions } from 'vuex';
import Checkbox from './Checkbox';

export default {
    components: {
        'b-checkbox': Checkbox
    },

    data() {
        return {
            firstname: '',
            lastname: '',
            rmail: '',
            lmail: '',
            cgu: false,
            ticket: false,
            ticketNumber: '',
            pin: '',
            tab: 'connect',
            working: false
        };
    },

    methods: {
        ...mapActions(['login', 'register', 'assign', 'notify']),

        changeTab(tab) {
            this.tab = tab;
            this.firstname = '';
            this.lastname = '';
            this.rmail = '';
            this.rpin = '';
            this.lmail = '';
            this.pin = '';
            this.ticketNumber = '';
            this.cgu = false;
            this.ticket = false;

            setTimeout(() => {
                if (this.tab === 'connect') {
                    this.$refs.lmail.focus();
                    return;
                }

                this.$refs.firstname.focus();
            });
        },

        sendAssign(ticketNumber) {
            if (this.working) {
                return;
            }

            this.working = true;

            this.assign({ ticketNumber })
                .then(() => {
                    this.$router.push('/assign/success');
                })
                .catch(err => {
                    this.ticketNumberInput.valid = false;

                    if (err.status === 410) {
                        return this.notify({ message: 'Le compte existe déjà.' });
                    }

                    this.notify({ message: 'Numéro de billet ou mail introuvable.' });
                })
                .then(() => {
                    setTimeout(() => {
                        this.working = false;
                    }, 500);
                });
        },

        sendRegister(firstname, lastname, rmail, cgu) {
            if (this.working) {
                return;
            }

            if (!cgu) {
                return this.notify({ message: 'Vous devez accepter les conditions générales.' });
            }

            this.working = true;

            this.register({ firstname, lastname, rmail })
                .then(() => {
                    this.$router.push('/assign/success');
                })
                .catch(err => {
                    this.ticketNumberInput.valid = false;

                    if (err.status === 404) {
                        return this.notify({ message: 'Le compte existe déjà.' });
                    }

                    this.notify({ message: 'Numéro de billet introuvable.' });
                })
                .then(() => {
                    setTimeout(() => {
                        this.working = false;
                    }, 500);
                });
        },

        log(mail, pin) {
            if (this.working) {
                return;
            }

            this.working = true;

            this.login({ meanOfLogin: process.env.defaultMol, data: mail, pin })
                .then(() => this.$router.push('/reload'))
                .catch(() => this.notify({ message: 'Identifiants incorrects.' }))
                .then(() => {
                    setTimeout(() => {
                        this.working = false;
                    }, 500);
                });
        }
    },

    computed: {
        tabConnect() {
            return this.tab === 'connect' ? 'b-home__tabs__tab--active' : '';
        },

        tabRegister() {
            return this.tab.indexOf('register') === 0 ? 'b-home__tabs__tab--active' : '';
        },

        ...mapState({
            logged: state => !!state.app.loggedUser
        })
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.rmail);
        MDCTextField.attachTo(this.$refs.lmail);
        MDCTextField.attachTo(this.$refs.pin);
        MDCTextField.attachTo(this.$refs.firstname);
        MDCTextField.attachTo(this.$refs.lastname);
        this.ticketNumberInput = MDCTextField.attachTo(this.$refs.ticketNumber);
    }
};
</script>

<style lang="scss">
$mdc-theme-primary: #27ae60 !default;

.b-home__tabs {
    display: flex;
}

.b-home__tabs__tab {
    position: relative;
    flex: 1;
    padding: 16px 0;
    cursor: pointer;
    text-transform: uppercase;
    text-align: center;
    background-color: #dfdfdf;
}

.b-home__tabs__tab--active {
    color: $mdc-theme-primary;
    background-color: #fff;
}

.b-home__register-chooser {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 32px 0;
}

.b-home__register-chooser > .mdc-button {
    width: 90%;
    margin: 16px auto;
    font-weight: 600;
    height: 48px;
}
</style>

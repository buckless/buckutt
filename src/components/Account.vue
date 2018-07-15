<template>
    <div class="b-account">
        <div class="mdc-card">
            <section class="mdc-card__primary" @click="pinPage = !pinPage">
                <h1 class="mdc-card__title mdc-card__title--large">
                    <i class="material-icons" :active="pinPage">keyboard_arrow_right</i>
                    Changer mon code PIN
                </h1>
            </section>
            <transition name="slide">
                <form class="b-changepin" @submit.prevent="change(currentPin, pin, confirmedPin)" v-show="pinPage">
                    <section class="mdc-card__supporting-text">
                        Le nouveau code PIN doit exclusivement être composé de 4 chiffres.
                        <label class="mdc-text-field" ref="currentPin">
                            <input type="password" class="mdc-text-field__input" required pattern="\d{4}" v-model="currentPin">
                            <span class="mdc-text-field__label">Code PIN actuel</span>
                            <div class="mdc-text-field__bottom-line"></div>
                        </label>
                        <label class="mdc-text-field" ref="pin">
                            <input type="password" class="mdc-text-field__input" required pattern="\d{4}" v-model="pin">
                            <span class="mdc-text-field__label">Nouveau code PIN</span>
                            <div class="mdc-text-field__bottom-line"></div>
                        </label>
                        <label class="mdc-text-field" ref="confirmedPin">
                            <input type="password" class="mdc-text-field__input" required pattern="\d{4}" v-model="confirmedPin">
                            <span class="mdc-text-field__label">Confirmation</span>
                            <div class="mdc-text-field__bottom-line"></div>
                        </label>
                    </section>
                    <section class="mdc-card__actions">
                        <button class="mdc-button mdc-button--raised" :disabled="disablePin">Valider</button>
                    </section>
                </form>
            </transition>
        </div>
        <div class="mdc-card">
            <section class="mdc-card__primary" @click="addCardPage = !addCardPage">
                <h1 class="mdc-card__title mdc-card__title--large">
                    <i class="material-icons" :active="addCardPage">keyboard_arrow_right</i>
                    Mon support cashless
                </h1>
            </section>
            <transition name="slide">
                <div v-show="addCardPage">
                    <form class="b-assigncard" @submit.prevent="assignCard(card)" v-show="!userData.card">
                        <section class="mdc-card__supporting-text">
                            <template v-if="userData.blockedCards.length > 0">
                                Ce compte est associé avec les supports bloqués suivants:
                                <template v-for="(blockedCard, index) in userData.blockedCards">
                                    <strong :key="index">{{ blockedCard }}</strong>
                                    <template v-if="index < userData.blockedCards.length - 1">, </template>
                                    <template v-else>.</template>
                                </template>
                                <br /><br />
                            </template>
                            Pour lier un nouveau support à votre espace cashless, saisissez ici l'identifiant présent au dos de celui-ci.
                            <label class="mdc-text-field" ref="card">
                                <input type="text" class="mdc-text-field__input" required v-model="card">
                                <span class="mdc-text-field__label">Identifiant du support cashless</span>
                                <div class="mdc-text-field__bottom-line"></div>
                            </label>
                        </section>
                        <section class="mdc-card__actions">
                            <button class="mdc-button mdc-button--raised" :disabled="disableCard">Valider</button>
                        </section>
                    </form>
                    <p class="b-cardtext" v-if="userData.card">
                        Votre espace cashless est associé avec le support <strong>{{ userData.card }}</strong>.<br /><br />
                        Souhaitez-vous bloquer le support ? Cette action est irreversible.
                        <br/>
                        <br/>
                        <button class="mdc-button mdc-button--raised" @click="block">Oui, bloquer mon support</button>
                    </p>
                </div>
            </transition>
        </div>
        <div class="mdc-card">
            <section class="mdc-card__primary" @click="addTicketPage = !addTicketPage">
                <h1 class="mdc-card__title mdc-card__title--large">
                    <i class="material-icons" :active="addTicketPage">keyboard_arrow_right</i>
                    Mon billet d'entrée
                </h1>
            </section>
            <transition name="slide">
                <div v-show="addTicketPage">
                    <form class="b-assignticket" @submit.prevent="assignTicket(ticket)" v-show="!userData.ticket">
                        <section class="mdc-card__supporting-text">
                            Pour lier votre billet d'entrée à votre espace cashless, saisissez ici votre numéro de billet.
                            <label class="mdc-text-field" ref="ticket">
                                <input type="text" class="mdc-text-field__input" required v-model="ticket">
                                <span class="mdc-text-field__label">Numéro de billet</span>
                                <div class="mdc-text-field__bottom-line"></div>
                            </label>
                        </section>
                        <section class="mdc-card__actions">
                            <button class="mdc-button mdc-button--raised" :disabled="disableTicket">Valider</button>
                        </section>
                    </form>
                    <p class="b-cardtext" v-if="userData.ticket">
                        Votre espace cashless est associé avec le billet numéro <strong>{{ userData.ticket }}</strong>.
                    </p>
                </div>
            </transition>
        </div>
        <div class="mdc-card">
            <section class="mdc-card__primary" @click="accountRefundPage = !accountRefundPage">
                <h1 class="mdc-card__title mdc-card__title--large">
                    <i class="material-icons" :active="accountRefundPage">keyboard_arrow_right</i>
                    Demander un remboursement
                </h1>
            </section>
            <transition name="slide">
                <div v-show="accountRefundPage">
                    <p class="b-cardtext">
                        Si l'organisateur a activé cette option, vous pouvez être remboursé de votre solde restant.
                        Le solde maximum remboursable correspond à la somme de vos rechargements sur Internet. Il n'est pas possible de rembourser les montants rechargés en physique.<br/>
                        <template v-if="refund.minimum > -1 && refund.allowed">
                            Vous pouvez demander le remboursement de <strong>{{ refund.refundable | price(true) }}</strong>
                        </template>
                        <br/>
                        <br/>
                        <template v-if="refund.allowed">
                            <button class="mdc-button mdc-button--raised" @click="accountRefund">Demander un remboursement</button>
                        </template>
                        <template v-else>
                            <div v-for="(error, i) in whyCannotRefund" :key="i">
                                {{ error }}
                            </div>
                        </template>
                    </p>
                </div>
            </transition>
        </div>
        <div class="mdc-card" v-if="userData.username">
            <section class="mdc-card__primary" @click="qrPage = !qrPage">
                <h1 class="mdc-card__title mdc-card__title--large">
                    <i class="material-icons" :active="qrPage">keyboard_arrow_right</i>
                    Mon QR Code
                </h1>
            </section>
            <transition name="slide">
                <div class="b-cardtext" @submit.prevent="change(currentPin, pin, confirmedPin)" v-show="qrPage">
                    Une fois sur place, vous pourrez utiliser ce QR Code ou votre billet pour récupérer votre support cashless.
                    <img :src="qrcode" alt="qr code" />
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapActions, mapState } from 'vuex';

import price from '../lib/price';
import { formatDate } from '../lib/date';

export default {
    data() {
        return {
            qrPage: false,
            blockPage: false,
            pinPage: false,
            addCardPage: false,
            addTicketPage: false,
            accountRefundPage: false,
            currentPin: '',
            pin: '',
            confirmedPin: '',
            card: '',
            ticket: '',
            disablePin: false,
            disableCard: false,
            disableTicket: false
        };
    },

    computed: {
        ...mapState({
            loggedUser: state => state.app.loggedUser,
            refund: state => state.app.refund
        }),

        whyCannotRefund() {
            const errors = [];
            const now = new Date();

            if (this.refund.alreadyAsked) {
                return [
                    `Vous avez déjà fait votre demande de remboursement au ${formatDate(
                        this.refund.alreadyAsked.created_at
                    )}`
                ];
            }

            if (this.refund.minimum <= 0) {
                return ["Le remboursement n'a pas été activé par l'organisateur"];
            }

            if (this.refund.refundable < this.refund.minimum) {
                errors.push(`Le remboursement minimum est de : ${price(this.refund.minimum, true)}`);
            }

            if (now <= this.refund.start) {
                errors.push(
                    `Les remboursements ne sont pas encore ouverts avant le ${formatDate(
                        this.refund.start
                    )}`
                );
            }

            if (now >= this.refund.end) {
                errors.push(
                    `Les remboursements sont fermés depuis le ${formatDate(this.refund.end)}`
                );
            }

            return errors;
        },

        qrcode() {
            return `https://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=${this.userData
                .username || ''}`;
        },

        userData() {
            const userData = {};
            const ticket = this.loggedUser.meansOfLogin.find(mol => mol.type === 'ticketId');
            const card = this.loggedUser.meansOfLogin.find(
                mol => mol.type === 'cardId' && !mol.blocked
            );
            const username = this.loggedUser.meansOfLogin.find(mol => mol.type === 'username');
            if (ticket) {
                userData.ticket = ticket.physical_id || ticket.data;
            }

            if (card) {
                userData.card = card.physical_id || card.data;
            }

            userData.blockedCards = this.loggedUser.meansOfLogin
                .filter(mol => mol.type === 'cardId' && mol.blocked)
                .map(blockedCard => blockedCard.physical_id || blockedCard.data);

            if (username) {
                userData.username = username.data;
            }

            return userData;
        }
    },

    methods: {
        ...mapActions(['changePin', 'notify', 'assign', 'block', 'accountRefund', 'canRefund']),

        change(currentPin, pin, confirmedPin) {
            this.disablePin = true;
            this.changePin({ currentPin, pin, confirmedPin })
                .then(message => {
                    this.currentPin = '';
                    this.pin = '';
                    this.confirmedPin = '';
                    this.notify(message);
                })
                .catch(error => this.notify(error))
                .then(() => {
                    this.disablePin = false;
                });
        },

        assignTicket(ticketNumber) {
            this.disableTicket = true;
            this.assign({ ticketNumber })
                .then(message => {
                    this.ticket = '';
                    this.notify(message);
                })
                .catch(error => this.notify(error))
                .then(() => {
                    this.disableTicket = false;
                });
        },

        assignCard(physicalId) {
            this.disableCard = true;
            this.assign({ physicalId })
                .then(message => {
                    this.card = '';
                    this.notify(message);
                })
                .catch(error => this.notify(error))
                .then(() => {
                    this.disableCard = false;
                });
        }
    },

    mounted() {
        MDCTextField.attachTo(this.$refs.currentPin);
        MDCTextField.attachTo(this.$refs.pin);
        MDCTextField.attachTo(this.$refs.ticket);
        MDCTextField.attachTo(this.$refs.confirmedPin);
        MDCTextField.attachTo(this.$refs.card);

        this.canRefund();
    }
};
</script>

<style>
.b-account h1 {
    padding: 0 !important;
    cursor: pointer;

    & > i {
        vertical-align: middle;
        margin-right: 5px;
        transition: 0.12s ease transform;

        &[active] {
            transform: rotate(90deg) !important;
        }
    }

    &:hover i {
        transform: rotate(45deg);
    }
}

.b-account .mdc-card:not(:first-child) {
    margin-top: 24px;
}

.b-account img {
    max-width: 100%;
    margin: 0 auto;
    display: block;
}

.b-account .b-cardtext {
    padding: 0 16px;
}

.b-account .b-block {
    padding: 0 16px 16px;
}

.b-account .b-block button {
    margin-top: 12px;
}
</style>

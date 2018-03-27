<template>
    <div class="b-assigner-search">
        <form @submit.prevent="closeSearch">
            <div class="b-assigner-search__type">
                <a
                    :class="{ 'b--active': searchBy === 'ticketId' }"
                    @click.prevent="searchBy = 'ticketId'">
                    Par numéro de ticket
                </a>
                <a
                    :class="{ 'b--active': searchBy === 'name' }"
                    @click.prevent="searchBy = 'name'">
                    Par nom
                </a>
            </div>

            <input
                type="text"
                name="search"
                @keyup="search"
                class="b-assigner-search__input"
                :placeholder="searchBy === 'name' ? 'Nom' : 'Numéro de ticket'"
                ref="search"
                v-model="searchInput">

            <h4>Résultats :</h4>
            <div class="b-assigner-search__results" v-show="matches.length > 0">
                <div
                    class="b-assigner-search__results__result"
                    v-for="match in matches"
                    v-if="matches[0].firstname"
                    @click="selectUser(match)">{{ match.firstname }} {{ match.lastname }}</div>
                <div
                    class="b-assigner-search__results__result"
                    v-for="match in matches"
                    v-if="matches[0].name"
                    @click="selectUser(match)">{{ match.name }}</div>
            </div>
            <p v-show="matches.length === 0 && searchInput.length === 0">Cherchez un utilisateur par son nom et son prénom. Trois caractères minimums.</p>
            <p v-show="matches.length === 0 && searchInput.length > 2">Aucun résultat.</p>
        </form>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import debounce from 'lodash.debounce';
import axios from '@/utils/axios';

import OfflineData from '@/../lib/offlineData';

export default {
    data() {
        return {
            searchBy: 'name',
            db: null,
            searchInput: '',
            matches: []
        };
    },

    computed: {
        ...mapState({
            online: state => state.online.status
        }),

        ...mapGetters(['tokenHeaders'])
    },

    methods: {
        closeSearch() {
            this.$refs.search.blur();
        },

        search: debounce(function () {
            if (this.searchInput.length <= 2) {
                return;
            }

            if (this.online) {
                if (this.searchBy === 'name') {
                    axios.get(`${config.api}/services/manager/searchuser?name=${this.searchInput}`, this.tokenHeaders)
                        .then((res) => {
                            this.matches = res.data;
                        });
                } else {
                    const filterRel = [ {
                        embed   : 'meansOfLogin',
                        filters : [
                            ['type', '=', 'ticketId'],
                            ['data', 'like', `${this.searchInput}%`]
                        ],
                        required: true
                    } ];

                    const embed = encodeURIComponent(JSON.stringify(filterRel));

                    axios.get(`${config.api}/users?embed=${embed}`, this.tokenHeaders)
                        .then((res) => {
                            this.matches = res.data;
                        });
                }
            } else {
                this.db.findUser(this.searchInput)
                    .then((users) => {
                        this.matches = users;
                    });
            }
        }, 500),

        selectUser(user) {
            if (this.online) {
                this.$emit('assign', user.credit, `${user.firstname} ${user.lastname}`, user.id);
            } else {
                this.$emit('assign', user.credit, user.name, user.id);
            }
        }
    },

    mounted() {
        this.db = new OfflineData();

        this.db.init();
    }
}
</script>

<style scoped>
@import '../main.css';

.b-assigner-search__type {
    display: flex;
    justify-content: space-around;

    & > a {
        color: $lightblue;
        padding: 5px 10px;
        border-radius: 3px;

        &.b--active {
            background-color: $lightblue;
            color: #fff;
        }
    }
}

.b-assigner-search {
    background-color: #f3f3f3;
    flex: 1;
}

.b-assigner-search h4 {
    text-transform: uppercase;
    color: rgba(0,0,0,.7);
    font-size: 14px;
}

.b-assigner-search > form {
    width: 50%;
    max-width: 500px;
    margin: 40px auto;
}

.b-assigner-search__input {
    display: block;
    width: 100%;
    padding: 10px;
    border-radius: 42px;
    border: 1px solid rgba(0,0,0,.2);

    &:not(:first-child) {
        margin-top: 16px;
    }

    &:focus {
        outline: 0;
        border: 1px solid #2980b9;
    }
}

.b-assigner-search__results {
    background-color: #fff;
    border: 1px solid rgba(0,0,0,.2);
    border-radius: 3px;
    margin: 16px 0;
}

.b-assigner-search__results__result {
    padding: 10px;
    cursor: pointer;
}

@media(max-width: 768px) {
    .b-assigner-search > form {
        width: calc(100% - 20px);
        margin: 10px auto;
    }
}
</style>

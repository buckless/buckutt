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
                @input="search"
                class="b-assigner-search__input"
                :placeholder="searchBy === 'name' ? 'Nom' : 'Numéro de ticket'"
                ref="search"
                v-model="searchInput">

            <h4>Résultats :</h4>
            <div class="b-assigner-search__results" v-if="matches.length > 0 && searchInput.length > 2">
                <div
                    class="b-assigner-search__results__result"
                    v-for="match in matches"
                    @click="selectUser(match)">{{ match.name }}</div>
            </div>
            <p v-else-if="searchInput.length <= 2">Cherchez un utilisateur par son nom et son prénom. Trois caractères minimums.</p>
            <p v-else>Aucun résultat.</p>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import debounce from 'lodash.debounce';

export default {
    data() {
        return {
            searchBy: 'name',
            searchInput: '',
            matches: []
        };
    },

    methods: {
        closeSearch() {
            this.$refs.search.blur();
        },

        formatOfflineResults(users) {
            const now = new Date();

            return Promise.all(
                users.map(user =>
                    window.database.userMemberships(user.uid).then(memberships => {
                        const currentGroups = memberships
                            .filter(
                                membership =>
                                    new Date(membership.start) <= now &&
                                    new Date(membership.end) >= now
                            )
                            .map(membership => ({ id: membership.group }));

                        return {
                            data: {
                                credit: user.credit,
                                name: user.name,
                                username: user.username,
                                id: user.uid,
                                currentGroups
                            }
                        };
                    })
                )
            );
        },

        search: debounce(function() {
            const now = new Date();

            if (this.searchInput.length <= 2) {
                return;
            }

            let searchPromise;
            if (this.searchBy === 'name') {
                searchPromise = this.sendRequest({
                    url: `services/manager/searchuser?name=${this.searchInput}`,
                    noQueue: true,
                    offlineAnswer: window.database
                        .findByName(this.searchInput)
                        .then(users => this.formatOfflineResults(users))
                });
            } else {
                const filterRel = [
                    {
                        embed: 'meansOfLogin',
                        filters: [
                            ['type', '=', 'ticketId'],
                            ['data', 'like', `${this.searchInput}%`]
                        ],
                        required: true
                    },
                    {
                        embed: 'memberships'
                    },
                    {
                        embed: 'memberships.period',
                        filters: [['start', '<', now], ['end', '>', now]],
                        required: true
                    }
                ];

                const embed = encodeURIComponent(JSON.stringify(filterRel));

                searchPromise = this.sendRequest({
                    url: `users?embed=${embed}`,
                    noQueue: true,
                    offlineAnswer: window.database
                        .findByBarcode(this.searchInput)
                        .then(users => this.formatOfflineResults(users))
                });
            }

            searchPromise
                .then(res =>
                    res.data.map(user => {
                        if (user.firstname) {
                            user.name = `${user.firstname} ${user.lastname}`;
                        }

                        if (user.memberships) {
                            user.currentGroups = user.memberships.map(membership => ({
                                id: membership.group_id
                            }));
                        }

                        return user;
                    })
                )
                .then(users => {
                    this.matches = users;
                });
        }, 500),

        selectUser(user) {
            this.$emit(
                'assign',
                user.credit,
                user.name,
                user.username,
                user.id,
                user.currentGroups
            );
        },

        ...mapActions(['sendRequest'])
    }
};
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
    color: rgba(0, 0, 0, 0.7);
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
    border: 1px solid rgba(0, 0, 0, 0.2);

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
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    margin: 16px 0;
}

.b-assigner-search__results__result {
    padding: 10px;
    cursor: pointer;
}

@media (max-width: 768px) {
    .b-assigner-search > form {
        width: calc(100% - 20px);
        margin: 10px auto;
    }
}
</style>

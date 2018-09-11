<template>
    <div class="b-assigner-search">
        <input
            type="text"
            name="search"
            @input="search"
            class="b-assigner-search__input"
            placeholder="Nom ou numéro de billet (4 caractères mini)"
            ref="search">
        <h4>
            <template v-if="searchInput < 4">Tickets ({{ tickets.length }} entrées) :</template>
            <template v-else>Résultats :</template>
            <i class="b-icon" :disabled="updatingTickets" @click="updateTickets">refresh</i>
        </h4>
        <div class="b-assigner-search__results" v-if="matches.length > 0 && searchInput.length >= 4">
            <div
                class="b-assigner-search__results__result"
                v-for="match in matches"
                :key="match.id"
                @click="selectUser(match)"
            >
                {{ match.name }}
                <div v-if="match.mail">
                    <em>{{ match.mail }}</em>
                </div>
            </div>
        </div>
        <p v-else-if="searchInput.length >= 4">Aucun résultat.</p>
        <div class="b-assigner-search__results" v-else>
            <recycle-list class="scroller" :items="tickets" :buffer="60" :item-height="38" key-field="id">
                <template slot-scope="{ item, index, active }">
                    <div class="b-assigner-search__results__result" @click="selectUser(item)">
                        {{ item.name }}
                        <div v-if="item.mail">
                            <em>{{ item.mail }}</em>
                        </div>
                    </div>
                </template>
            </recycle-list>
        </div>
    </div>
</template>

<script>
import { RecycleList } from 'vue-virtual-scroller';
import formatOfflineResults from '@/utils/formatOfflineResults';

export default {
    components: {
        RecycleList
    },

    data() {
        return {
            searchBy: 'name',
            searchInput: '',
            updatingTickets: false,
            tickets: [],
            matches: []
        };
    },

    methods: {
        closeSearch() {
            this.$refs.search.blur();
        },

        search(e) {
            this.searchInput = e.target.value;

            if (this.searchInput.length < 4) {
                return;
            }

            window.database
                .find(this.searchInput)
                .then(users => formatOfflineResults(users))
                .then(users => {
                    this.matches = users.data.map(user => {
                        if (user.firstname) {
                            user.name = `${user.firstname} ${user.lastname}`;
                        }

                        if (user.memberships) {
                            user.currentGroups = user.memberships.map(membership => ({
                                id: membership.group_id
                            }));
                        }

                        return user;
                    });

                    console.log(this.matches);
                    console.log(this);
                });
        },

        selectUser(user) {
            this.$emit(
                'assign',
                user.credit,
                user.name,
                user.username,
                user.id,
                user.currentGroups,
                user.searchBy === 'ticketId' ? this.searchInput : null
            );
        },

        updateTickets() {
            this.updatingTickets = true;

            window.database
                .listTickets()
                .then(tickets => formatOfflineResults(tickets))
                .then(
                    tickets =>
                        (this.tickets = tickets.data.sort((a, b) => a.name.localeCompare(b.name)))
                )
                .then(() => this.unlock());
        },

        unlock() {
            setTimeout(() => {
                this.updatingTickets = false;
            }, 400);
        }
    },

    mounted() {
        this.updateTickets();
    }
};
</script>

<style scoped>
@import '../main.css';

.b-assigner-search {
    background-color: #f3f3f3;
    flex: 1;
    padding: 10px;
    max-height: calc(100% - 40px);
}

.b-assigner-search h4 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-transform: uppercase;
    margin: 14px 0;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
}

.b-icon {
    cursor: pointer;

    &[disabled] {
        color: #ccc;
    }
}

.b-assigner-search__input {
    display: block;
    width: 100%;
    padding: 10px;
    border-radius: 42px;
    border: 1px solid rgba(0, 0, 0, 0.2);

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
    height: calc(100% - 100px);
    overflow: hidden;
    position: relative;
}

.scroller {
    max-height: 100%;
    width: 100%;
    position: absolute;
}

.b-assigner-search__results__result {
    padding: 10px;
    cursor: pointer;
}
</style>

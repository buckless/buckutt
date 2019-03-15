<template>
    <div class="b-assigner-search">
        <input
            type="text"
            name="search"
            @input="search"
            class="b-assigner-search__input"
            placeholder="Nom ou numéro de billet (4 caractères mini)"
            ref="search"
        />
        <h4>
            <template v-if="searchInput < 4"
                >Tickets ({{ tickets.length }} entrées) :</template
            >
            <template v-else
                >Résultats :</template
            >
            <div class="b-space"></div>
            <i class="b-icon" @click="$emit('blankCard')">add</i>
            <i class="b-icon" :disabled="updatingTickets" @click="updateTickets">refresh</i>
        </h4>
        <div class="b-assigner-search__results" v-if="displayedResults.length">
            <recycle-scroller
                class="scroller"
                :items="displayedResults"
                :buffer="60"
                :item-height="56"
                key-field="id"
            >
                <template slot-scope="{ item }">
                    <div class="b-assigner-search__results__result" @click="selectUser(item)">
                        {{ item.name }}
                        <div>
                            <em>{{ item.mail }}</em>
                        </div>
                    </div>
                </template>
            </recycle-scroller>
        </div>
        <p v-else>Aucun résultat.</p>
    </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';

export default {
    components: {
        RecycleScroller
    },

    data() {
        return {
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

            window.database.find(this.searchInput).then(tickets => {
                this.matches = tickets;
            });
        },

        selectUser(user) {
            this.$emit(
                'assign',
                user.credit,
                user.name,
                user.id,
                null,
                user.barcode,
                user.ticketId,
                user.walletId
            );
        },

        updateTickets() {
            this.updatingTickets = true;

            window.database
                .listTickets()
                .then(
                    tickets => (this.tickets = tickets.sort((a, b) => a.name.localeCompare(b.name)))
                )
                .then(() => {
                    window.tickets = this.tickets;
                    return this.unlock();
                });
        },

        unlock() {
            setTimeout(() => {
                this.updatingTickets = false;
            }, 400);
        }
    },

    computed: {
        displayedResults() {
            return this.searchInput.length >= 4 ? this.matches : this.tickets;
        }
    },

    mounted() {
        this.tickets = window.tickets || [];
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
    align-items: center;
    text-transform: uppercase;
    margin: 14px 0;
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
}

.b-icon {
    cursor: pointer;

    &:not(:last-of-type) {
        margin-right: 16px;
    }

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
    height: 100%;
    overflow-y: auto;
}

.b-assigner-search__results__result {
    padding: 10px;
    cursor: pointer;
    height: 56px;
    position: absolute;
    width: 100%;
}
</style>

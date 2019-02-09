<template>
    <div>
        <nav ref="nav">
            <router-link
                v-for="(tab, i) in tabs"
                :to="tab.route"
                :class="tab.classes"
                :key="i"
                tag="li"
                @click.native="updateLine"
            >
                {{ tab.name }}
            </router-link>
            <div v-show="actualRoute > -1" :style="lineStyle" class="line" />
            <div class="space" />
            <router-link
                :active="$route.path === '/dashboard/account'"
                to="/dashboard/account"
                tag="li"
                class="account"
            >
                <Icon :size="1.7" name="account_circle" />
            </router-link>
        </nav>
        <section>
            <slot />
        </section>
    </div>
</template>

<script>
import Icon from '@/components/Icon';

export default {
    name: 'Tabs',

    components: {
        Icon
    },

    props: {
        tabs: { type: Array, default: () => [] }
    },

    data: () => ({
        width: '0px',
        left: '0px'
    }),

    computed: {
        actualRoute() {
            return this.tabs.map(t => t.route).indexOf(this.$route.path);
        },

        lineStyle() {
            return {
                width: this.width,
                transform: `translateX(${this.left})`
            };
        }
    },

    mounted() {
        this.updateSizes();
        this.updateLine();

        window
            .matchMedia('(max-width: 768px)')
            .addListener(() => this.$nextTick(() => this.updateSizes()));
        window
            .matchMedia('(max-width: 400px)')
            .addListener(() => this.$nextTick(() => this.updateSizes()));
    },

    updated() {
        this.updateSizes();
    },

    methods: {
        updateLine() {
            requestAnimationFrame(() => this.updateLine());

            if (!this.$refs.nav) {
                return;
            }

            // width = 10 → tab is hidden
            if (this.widths[this.actualRoute] === '10.0') {
                this.width = '0px';
                this.left = '0px';

                return;
            }

            this.width = `${this.widths[this.actualRoute]}px`;
            this.left = `${this.lefts[this.actualRoute]}px`;
        },

        updateSizes() {
            if (!this.$refs.nav) {
                return;
            }

            this.widths = Array.from(this.$refs.nav.children).map(c =>
                (c.getBoundingClientRect().width + 10).toFixed(1)
            );

            this.lefts = Array.from(this.$refs.nav.children).map(c =>
                (c.getBoundingClientRect().left - 5).toFixed(1)
            );
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

nav {
    display: flex;
    height: 3rem;
    background-color: $cardBackground;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    align-items: center;
    padding: 0 1rem;
    position: relative;
}

li {
    height: 3rem;
    line-height: 3rem;
    list-style: none;
    font-weight: 500;
    cursor: pointer;

    &:not(:last-child) {
        margin-right: 1rem;
    }
}

.line {
    height: 5px;
    background-color: $theme;
    border-top-left-radius: 1px;
    border-top-right-radius: 1px;
    position: absolute;
    left: 0;
    bottom: 0;
    transition: 0.2s ease transform, 0.2s ease width;
}

.account {
    height: 2.7rem;
    padding: 0.5rem;
    line-height: initial;

    &:hover,
    &[active] {
        color: $theme;
        transition: 0.15s ease color;
    }
}

section > :first-child {
    max-width: 732px;
    margin: 0 auto;
}

@media (min-width: $break-sm) {
    nav {
        height: 3.75rem;
        padding: 0 2rem;
    }

    li {
        height: 3.75rem;
        line-height: 3.75rem;

        &:not(:last-child) {
            margin-right: 2rem;
        }
    }
}
</style>

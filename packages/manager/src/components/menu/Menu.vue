<template>
    <nav class="menu" :active="isOpened">
        <Button class="menu-button" @click="close" whiteBackground>
            {{ $t('common.close') }}
        </Button>

        <router-link to="/dashboard" class="link" active-class="active" exact>
            <Icon name="home" :size="32" />
            <span class="text">{{ $t('components.menu.home') }}</span>
        </router-link>
        <router-link to="/dashboard/wallet" class="link" active-class="active">
            <Icon name="account_balance_wallet" :size="32" />
            <span class="text">{{ $t('components.menu.support') }}</span>
        </router-link>
        <router-link to="/dashboard/ticket" class="link" active-class="active">
            <Icon name="theaters" :size="32" />
            <span class="text">{{ $t('components.menu.ticket') }}</span>
        </router-link>
        <router-link to="/dashboard/user" class="link" active-class="active">
            <Icon name="person" :size="32" />
            <span class="text">{{ $t('components.menu.account') }}</span>
        </router-link>
        <router-link to="/dashboard/faq" class="link bottom" active-class="active">
            <Icon name="live_help" :size="32" />
            <span class="text">{{ $t('components.menu.help') }}</span>
        </router-link>

        <div class="wallet-chooser">
            <WalletChooser />
        </div>
    </nav>
</template>

<script>
import Button from 'ui/src/components/Button/Button';
import Icon from 'ui/src/components/Icon/Icon';
import WalletChooser from '../wallet-chooser/WalletChooser';

export default {
    components: {
        Button,
        Icon,
        WalletChooser
    },

    props: {
        isOpened: Boolean
    },

    methods: {
        close() {
            this.$emit('close');
        },

        onDocumentClick(e) {
            if (!this.isOpened) {
                return;
            }

            if (!this.$el.contains(e.target)) {
                this.$emit('close');
            }
        }
    },

    beforeUpdate() {
        if (this.isOpened) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }
    },

    updated() {
        document.removeEventListener('click', this.onDocumentClick);

        if (this.isOpened) {
            setTimeout(() => {
                document.addEventListener('click', this.onDocumentClick);
            });
        }
    },

    beforeDestroy() {
        document.body.style.overflow = 'visible';
        document.removeEventListener('click', this.onDocumentClick);
    }
};
</script>

<style scoped>
.menu {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    display: flex;
    flex-direction: column;

    padding: 20px;

    background-color: var(--primary-300);
    z-index: 20;

    transform: translateY(-100%);
    transition: transform var(--transition-easing) var(--transition-long-out);
}

.menu[active] {
    transform: translateY(0);
    transition: transform var(--transition-easing) var(--transition-long-in);
    box-shadow: var(--elevation-3dp);
}

.menu-button {
    position: absolute;
    top: 12px;
    right: 12px;
    color: var(--grey-50);
}

.link {
    display: flex;
    align-items: center;
    padding: 0;
    border: 0;
    background-color: transparent;
    cursor: pointer;
    text-decoration: none;
    color: var(--grey-50);
    font-weight: 600;
}

.icon {
    color: color-mod(var(--grey-50) a(0.66));
    margin-right: 12px;
}

.link.active .icon {
    color: var(--grey-50);
}

.link.active .text {
    text-decoration: underline;
}

.link:focus,
.link:active {
    outline: 0;
}

.link:not(:last-of-type) {
    margin-bottom: 32px;
}

.wallet-chooser {
    margin-top: 12px;
}
</style>

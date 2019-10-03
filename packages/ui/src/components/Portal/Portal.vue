<template>
    <MountingPortal mountTo="body" append>
        <!-- @slot Portal content -->
        <slot />
    </MountingPortal>
</template>

<script>
import { MountingPortal } from 'portal-vue';

/**
 * Renders the content in <body>
 */
export default {
    name: 'Portal',

    components: {
        MountingPortal
    }
};
</script>

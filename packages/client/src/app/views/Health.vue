<template>
    <div class="b-health">
        <Alert />
        <List />
    </div>
</template>

<script>
import Alert from './Health-Alert';
import List from './Health-List';

export default {
    components: {
        Alert,
        List
    }
};
</script>


<style scoped>
.b-health {
    flex: 1;
    background: #fafafa;

    display: flex;
    scroll-snap-type: x mandatory;
    overflow: auto;
}

.b-health > div {
    scroll-snap-align: center;
    min-width: 100%;
}
</style>

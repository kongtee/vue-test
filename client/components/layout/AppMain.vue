<template>
    <section class="app-main">
        <transition mode="out-in" enter-active-class="fadeIn" leave-active-class="fadeOut" appear>
            <router-view></router-view>
        </transition>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        computed: {
            ...mapGetters({
                layout: 'layout'
            })
        },
        data() {
            return {};
        }
    };
</script>

<style lang="less" scoped>
    @import "../../assets/common/var";
    @import "../../assets/common/mixin";

    .app-main {
        .flex(1);
        .flexbox(column);
        margin: 0;
        padding: 0;
        overflow-y: auto;
        background-color: @main-background-color;
    }
</style>

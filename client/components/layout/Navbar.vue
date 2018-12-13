<template>
    <section class="app-navbar animated slideInDown">
        <slot></slot>
    </section>
</template>

<style lang="less" scoped>
    @import "../../assets/common/var";

    .app-navbar {
        min-width: 100%;
        z-index: @maxZindex;
        box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);
        background-color: @body-background-color;
        height: @navbarHeight;
    }
</style>

<script>
    export default {
    };
</script>

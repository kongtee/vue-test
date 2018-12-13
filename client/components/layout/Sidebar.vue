<template>
    <aside class="app-sidebar">
        <el-menu background-color="#272727" text-color="rgba(255, 255, 255, 0.8)" active-text-color="#F94D26" :default-active="defaultPath" mode="vertical" :collapse="false" @select="openPage">
            <template v-for="(item, index) in menuItems">
                <div v-if="item.show">
                    <el-menu-item v-if="!item.subs" :index="'#' + item.path" @click="jump(item.path)">
                        <i :class="['icon iconfont', item.meta.icon]"></i>
                        <span slot="title">{{ item.meta.label || item.name }}</span>
                    </el-menu-item>

                    <el-submenu v-else :index="'#subm' + index">
                        <template slot="title">
                            <i :class="['icon iconfont', item.meta.icon]"></i>
                            <span>{{ item.name }}</span>
                        </template>

                        <el-menu-item v-for="sub in item.subs" :index="'#' + sub.path" v-if="item.show"
                                      @click="jump(sub.path)">
                            {{ sub.name }}
                        </el-menu-item>
                    </el-submenu>
                </div>
            </template>
        </el-menu>
    </aside>
</template>

<style lang="less">
    @import "../../assets/common/var";

    .app-sidebar {
        width: @sidebarWidth;
        background: @body-background-color;
        box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: 6px;
        border-top: solid 1px #3c3c3c;
        .sidebar-menu {
            margin-left: 5px;
        }
    }
</style>

<script>
    import { mapGetters } from 'vuex';

    export default {
        components: {},
        props: {
            show: Boolean
        },
        data() {
            return {
                isReady: false
            };
        },
        computed: {
            ...mapGetters([
                'layout',
                'menuItems'
            ]),
            defaultPath: function () {
                let path = this.$route.path;
                path = path === '/op' ? '/' : path;
                return '#' + path;
            }
        },
        methods: {
            openPage(index, indexPath) {
                window.location.href = (index);
            },
            jump(path) {
                this.$router.push({
                    path: path
                });
            }
        }
    };
</script>

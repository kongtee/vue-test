<!--
@file: 主APP引入文件
-->
<template>
    <div id="app" class="pcadmin">
        <!--顶部导航-->
        <Navbar>
            <!--navbar 内容-->
            <flex-box class="hd" justify="space-between">
                <flex-box class="logo">
                    <span class="title">vue-test</span>
                </flex-box>

                <flex-box class="cmenus" justify="flex-start">
                    <!-- <a href="#/">
                        <span>主页</span>
                    </a> -->
                </flex-box>
            </flex-box>
            <!--navbar 内容结束-->
        </Navbar>
        <div class="main-content">
            <!--侧边栏-->
            <!--<Sidebar :show="layout.showSidebar" v-if="layout.showSidebar"></Sidebar>-->
            <!--页面内容-->
            <AppMain></AppMain>
        </div>
    </div>
</template>

<style lang="less">
@import './assets/css/index';

.pcadmin {
    height: 100vh;
    .flexbox(column);

    .hd {
        height: 100%;
        padding: 0 20px;
        font-size: @body-font-size;
        .logo {
            font-size: 20px;

            .title {
                font-size: 30px;
                color: #fff;
                font-weight: 300;
                font-family: @body-family;
            }
        }
        .cmenus {
            .flex(1);
            height: 100%;
            a {
                .center();
                padding: 0 20px;
                height: 100%;
                &:hover {
                    background-color: whitesmoke;
                }
            }
        }
        .user-info {
            .center();
            .user-tx {
                width: 44px;
                height: 44px;
                overflow: hidden;
                img {
                    width: 100%;
                }
            }
            .user-name {
                font-size: @body-font-size;
                font-weight: bold;
                color: #fff;
                margin: 0 9px;
            }
        }
    }

    .main-content {
        .flex(1);
        .flexbox();
    }
}
</style>

<script>
import { mapGetters } from 'vuex';
import {
    Navbar,
    // Sidebar,
    AppMain
} from './components/layout/index';

export default {
    components: {
        Navbar,
        // Sidebar,
        AppMain
    },
    data() {
        return {
        };
    },
    computed: {
        ...mapGetters(['layout'])
    },
    mounted() {
    }
};
</script>

export default [
    {
        name: '首页',
        meta: {
            icon: 'icon-home',
            expanded: false
        },
        show: false,
        path: '/'
    },
    {
        name: '音频工具',
        meta: {
            icon: 'icon-home',
            expanded: false
        },
        show: false,
        path: '/audio/wave',
        component() {
            return import('@Views/audio/wave.vue');
        },
    }
];

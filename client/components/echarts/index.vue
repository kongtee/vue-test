<template>
    <div ref='main' :style="{width: width, height: height}"></div>
</template>
<style lang='less'>
    .columnar { }
</style>
<script>
import Echarts from 'echarts';
export default {
    props: {
        width: {
            type: String,
            default: '90%'
        },
        height: {
            type: String,
            default: '350px'
        },
        options: {

        }
    },
    data () {
        return {
            myChart: null
        };
    },
    components: { },
    watch: {
        options () {
            this.draw();
        }
    },
    mounted () {
        let t = this;
        this.myChart = Echarts.init(this.$refs.main);
        this.draw();
        this.myChart.on('legendselectchanged', function (params, tt) {
            t.$emit('legendselectchanged', params);
        });
    },
    methods: {
        draw (options) {
            this.myChart.clear();
            this.myChart.setOption(options || this.options);
        }
    },
    computed: { }
};
</script>

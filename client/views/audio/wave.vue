<template>
    <div class="frequency-audio-wrap">
        <div class="frequency-audio-container" ref="audioContainer">
        </div>
    </div>
</template>

<script>
    import Kiddio from './kiddio'

    export default {
        name: "wave",
        mounted() {
            this.init();
        },
        methods: {
            init() {
                try {
                    new Kiddio({
                        url: 'https://ks3-cn-beijing.ksyun.com/imagemark/audio_20181020/44609f7a42be371a8fcfb796aebd91ed.wav',
                        container: this.$refs[ 'audioContainer' ]
                    });
                } catch (e) {
                    console.error(e);
                }
            }

        }
    }
</script>

<style lang='less'>
    .frequency-audio-wrap {
        background: #424242;
        padding: 8px 8px 0;

        .frequency-audio-container {
            &::-webkit-scrollbar {
                width: 3px;
                height: 10px;
            }
            &::-webkit-scrollbar-track {
                background-color: #424242;
            }
            &::-webkit-scrollbar-thumb {
                background-color: #6e6e6e;
                border-radius: 5px;
            }
        }
    }
</style>

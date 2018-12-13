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
                        url: '@Assets/media/Tokyo2020.mp3',
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
        padding: 20px 20px 0 20px;

        .frequency-audio-container {
            width: 100%;
            height: 330px;
            position: relative;
            /*background: #000;*/
            overflow-x: auto;
            overflow-y: hidden;
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
            #audioWave {
                position: absolute;
                z-index: 1;
                left: 0;
                top: 0;
            }
            #svg {
                position: absolute;
                z-index: 9;
                left: 0;
                top: 0;
            }
            #axisBox {
                position: absolute;
                top: 300px;
                left: 0;
                width: 100%;
                height: 30px;
                z-index: 1000;
                cursor: pointer;
            }
            .MyText {
                fill: #333;
                z-index: 100;
            }
        }
    }
</style>

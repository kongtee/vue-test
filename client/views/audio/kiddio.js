/**
 * Author: hanguangtian
 * Date: 2018/12/09
 * 语音标注工具库
 *
 * 使用请见README.md
 * 参数：option = {
 *     url: 'http://xxxx.com/xxx.mp3' // 必填项，音频地址
 *     container: node           // 必填项，容器的selector或者node
 *     axisHeight: number        // 选填，频谱图区域高度，默认值 250
 *     axisXHeight: number       // 选填，x轴区域高度，默认值 30
 *     coordinatesColor: color          // 选填，频谱图区域背景色，默认值 #000
 *     frequencyColor: color     // 选填，频谱颜色，默认值 #56dda2
 *     maxScale: number          // 选填，最大放大倍数，默认值 10
 *     perSeconds: number        // 选填，每屏显示秒数，默认值 10
 * }
 *
 * 例子：
 *      基础：
 * let kedAudio = new KedAudio({
 *     url: '',
 *     container: this.$refs[ 'audioContainer' ]
 * });
 *
 *      选填：
 * let kedAudio = new KedAudio({
 *     url: '',
 *     container: this.$refs[ 'audioContainer' ],
 *     axisHeight: 350,
 *     axisXHeight: 30,
 *     coordinatesColor: '#000',
 *     frequencyColor: '#56dda2',
 *     maxScale: 10，
 *     perSeconds: 10
 * });
 *
 * 功能：
 */

import * as d3 from 'd3';

// 错误信息
const ERR_INFO = {
    AUDIO_NO_EXIST: {
        msg: '音频文件不存在'
    },
    AUDIO_TYPE_ERR: {
        msg: '不是可识别的音频文件格式'
    },
    REQUEST_SEND_ERR: {
        msg: '发送请求错误'
    },
    REQUEST_NETWORK_ERR: {
        msg: '请求网络错误'
    },
    REQUEST_STATUS_ERR: {
        msg: '请求状态错误'
    },
    READ_LOCALFILE_ERR: {
        msg: '读取本地文件错误'
    },
    READ_FILE_ERR: {
        msg: '读取文件错误'
    },
    BROWSER_SUPPORT_ERR: {
        msg: '你的浏览器不支持AudioContext'
    },
    DECODE_AUDIO_ERR: {
        msg: '音频数据解码失败'
    }
};

const AXIS_HEIGHT = 250;         // 坐标系高度
const AXIS_X_HEIGHT = 30;       // 坐标系X轴高度
const COORDINATES_COLOR = '#000';   // 坐标系的背景色
const FREQUENCY_COLOR = '#56dda2';  // 频谱颜色
const AXIS_X_COLOR = '#424242';  // 坐标系X轴的背景色
const MAX_SCALE = 10;            // 最大放大倍数
const MIN_SCALE = 1;             // 最小缩小倍数
const PER_SCALE = 1;             // 每次缩放的倍数
const PER_SECONDS = 10;          // 每屏显示时长

class KedAudio {
    constructor(option) {
        // 初始化参数
        this.url = option.url;  // 必填项，音频地址。
        this.container = option.container;  // 必填项，容器标签
        this.axisHeight = option.axisHeight || AXIS_HEIGHT;  // 坐标系高度
        this.axisXHeight = option.axisXHeight || AXIS_X_HEIGHT;  // 坐标系X轴高度
        this.coordinatesColor = option.coordinatesColor || COORDINATES_COLOR;  // 坐标系背景色
        this.frequencyColor = option.frequencyColor || FREQUENCY_COLOR;  // 频谱颜色
        this.axisXColor = option.axisXColor || AXIS_X_COLOR;  // 坐标系X轴的背景色
        this.maxScale = option.maxScale || MAX_SCALE;  // 最大放大倍数
        this.minScale = option.minScale || MIN_SCALE;  // 最小缩小倍数，暂不支持最小倍数的配置
        this.perScale = option.perScale || PER_SCALE;  // 每次缩放的倍数
        this.perSeconds = option.perSeconds || PER_SECONDS;  // 每屏显示的时长

        // 外部属性
        this.context = null;  // 音频文件上下文环境
        this.buffer = null;   // 音频数据
        this.containerWidth = 0;  // 容器的宽度
        this.containerHeight = 0; // 容器的高度
        this.scale = 1;       // 放大倍数
        this.duration = 10;   // 音频时长
        this.playLine = null;     // 播放线
        this.bufferSource = null; // 播放声音的音频源节点
        this.playParam = {
            when: 0,              // 延迟播放时间，单位为秒（非必填，默认值为0）
            offset: 0,            // 定位音频到第几秒开始播放
            duration: 0           // 从开始播放结束时长，当经过设置秒数后自动结束音频播放
        };                        // 播放参数

        // 内部属性
        this._d3Container = null;  // 容器转换为d3容器
        this._d3ContainerDom = null;  // d3容器原生节点，用来获取原生元素的一些属性
        this._svg = null;      // svg容器
        this._scaling = false; // 是否在缩放中
        this._axisWidth = 0;   // 坐标系宽度
        this._timeWidth = 0;   // 音频的宽度
        this._step = 0;   // 大刻度步长
        this._frequencyArry = [];  // 存放频谱数值数组
        this._curPointScale = 0;   // 当前鼠标点相对于频谱区左侧的位置比例，用于缩放以当前鼠标点定位
        this._offsetX = 0;         // 当前鼠标点相对于d3容器的偏移量

        this._init();
    }

    /**
     * 初始化
     * @private
     */
    _init() {
        // 检测是否存在音频文件
        if (!this.url) {
            throw ERR_INFO.AUDIO_NO_EXIST;
        }
        // 检测是否是可识别的音频文件格式
        if (!this._checkAudioFileType(this.url)) {
            throw ERR_INFO.AUDIO_TYPE_ERR;
        }

        let AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

        try {
            this.context = new AudioContext();
        } catch (e) {
            throw ERR_INFO.BROWSER_SUPPORT_ERR;
        }

        // 获取音频文件
        this._getAudioFile(this.url);
        // 创建SVG容器
        this._createSVGContainer(this.container);
        // 绘制坐标系
        this._drawCoordinates();
        // 事件绑定
        this._bindEvent();
    }

    /**
     * 检测是否是可识别的音频文件格式
     * @param url 音频文件地址
     * @private
     */
    _checkAudioFileType(url) {
        if (url.match(/\.(mp3|wav)$/)) {
            return true;
        }

        return false;
    }

    /**
     * 获取音频文件
     * @private
     */
    _getAudioFile(url) {
        if (url.match(/^https?/)) {
            // 网络音频
            let request = new XMLHttpRequest(); // 建立一个请求
            request.open('GET', url, true); // 配置好请求类型，文件路径等
            request.responseType = 'arraybuffer'; // 配置数据返回类型
            // 一旦获取完成，对音频进行进一步操作，比如解码
            request.onload = () => {
                // console.log('status:', request.status, request.response);
                if ((request.status >= 200 && request.status < 300) || request.status === 304) {
                    let audioData = request.response.slice(0);
                    this._decodeAudioData(audioData);
                } else {
                    throw ERR_INFO.REQUEST_STATUS_ERR;
                }
            };
            request.onerror = function (e) {
                throw ERR_INFO.REQUEST_NETWORK_ERR;
            };
            request.onprogress = function (e) {
                console.log('下载进度', e);
            };

            try {
                request.send(); // 发送请求
            } catch (e) {
                throw ERR_INFO.REQUEST_SEND_ERR;
            }
        } else {
            // 本地音频
            let fileReader = new FileReader();
            fileReader.onload = e => {
                const audioData = e.target.result;
                this._getAudioData(audioData);
            };

            fileReader.onerror = function (e) {
                throw ERR_INFO.READ_LOCALFILE_ERR;
            };

            fileReader.onprogress = function (e) {
                console.log('读取进度', e);
            };


            try {
                console.log('_getAudioFile:', url);
                fileReader.readAsArrayBuffer(url); // 读取本地文件
            } catch (e) {
                throw ERR_INFO.READ_FILE_ERR;
            }
        }
    }

    /**
     * 解码音频数据
     * @param data
     * @private
     */
    _decodeAudioData(data) {
        // console.log('_decodeAudioData:', data);
        this.context.decodeAudioData(data, buffer => {
            // 解码音频文件，获得文件信息
            this.buffer = buffer;
            this.duration = buffer.duration;
            console.log('duration:', this.duration);

            // 画频谱
            this._draw();
        }, function (e) {
            // 这个是解码失败
            throw ERR_INFO.DECODE_AUDIO_ERR;
        });
    }

    /**
     * 获取音频数据
     * @private
     */
    _getChannelData() {
        let buffer = this.buffer;
        // let maxTimeWidth = this._timeWidth * MAX_SCALE;  // 放到最大的时长宽度
        // let maxAxisWidth = this._axisWidth * MAX_SCALE;  // 放到最大的坐标系宽度
        let maxTimeWidth = this._timeWidth * this.scale;  // 放到当前的倍数的时长宽度
        let maxAxisWidth = this._axisWidth * this.scale;  // 放到最大的坐标系宽度
        let pixelStep = buffer.getChannelData(0).length / maxTimeWidth;  // 在最大宽度时每像素的抽点精度
        let frequencyData = new Float32Array(maxTimeWidth);  // 存放频谱数据的数组
        let axisHeight = this.axisHeight;  // 坐标系的高度

        // console.log('_getChannelData:', maxTimeWidth, pixelStep);
        for (let i = 0; i < maxTimeWidth; i++) {
            let frequency = 0.0;
            for (let j = 0; j < buffer.numberOfChannels; j++) {
                let channelData = buffer.getChannelData(j);
                frequency += channelData[ parseInt(pixelStep * i) ];
            }
            frequencyData[ i ] = frequency;
        }

        // console.log('_getChannelData:', frequencyData);

        // 生成坐标系内线性数值
        let minValue = d3.min(frequencyData);
        let maxValue = d3.max(frequencyData);
        let linear = d3.scaleLinear()
            .domain([ maxValue, 0, minValue ])
            .range([ 0, axisHeight / 2, axisHeight ]);

        // 生成坐标系内的坐标
        this._frequencyArry = [];
        for (let i = 0; i < maxTimeWidth; i++) {
            if (isNaN(linear(frequencyData[ i ]))) {
                this._frequencyArry.push(axisHeight / 2);
            } else {
                this._frequencyArry.push(linear(frequencyData[ i ]));
            }
        }

        // 如果音频时长小于一屏展示时长，后面补数据
        let lessLen = maxAxisWidth - maxTimeWidth;
        if (lessLen > 0) {
            for (let i = 0; i < lessLen; i++) {
                this._frequencyArry.push(axisHeight / 2);
            }
        }
        // console.log('_frequencyArry:', this._frequencyArry);
    }

    /**
     * 绘制
     * @private
     */
    _draw() {
        this._drawCoordinates();  // 绘制坐标系
        this._drawFrequency();    // 绘制频谱
        this._drawPlayLine();     // 绘制播放线段
    }

    /**
     * 重置频谱区
     * @private
     */
    _resetFrequency() {
        this._d3Container.select('#frequency').remove();
    }

    /**
     * 绘制频谱图
     * @private
     */
    _drawFrequency() {
        this._resetFrequency();
        this._getChannelData();

        // let len = this._frequencyArry.length * this.scale / this.maxScale;
        let len = this._frequencyArry.length;
        let _frequencyArry = this._frequencyArry;
        let drawArry = [];  // 存放频谱图路径
        let middleHeight = this.axisHeight / 2;   // 频谱中线的Y坐标

        // console.log('middleHeight:', middleHeight);
        // 频谱路径数组，基于最小缩放倍数为1的情况，如果更小需要做修改
        for (let i = 0; i < len; i++) {
            drawArry.push([ i, middleHeight ]);
            drawArry.push([ i, _frequencyArry[ i ] ]);
            drawArry.push([ i, middleHeight ]);
        }

        // console.log('_drawFrequency:', drawArry);
        // console.log('frequency:', this._timeWidth * this.scale, this.axisHeight, this.frequencyColor);

        let drawWidth = this._timeWidth * this.scale;
        if (drawWidth < this._axisWidth) {
            drawWidth = this._axisWidth
        }

        // 添加频谱元素
        this._d3Container.append('g')
            .attr('id', 'frequency')
            .attr('width', drawWidth)
            .attr('height', this.axisHeight)
            .attr('style', 'background-color: #f0f')
            .attr('transform', 'translate(0, 0)')
            // .attr('style', `background-color: ${this.coordinatesColor}`)
            .append('path')
            .attr('stroke', this.frequencyColor)
            .attr('fill', this.frequencyColor)
            .attr('stroke-width', 1 / window.devicePixelRatio)
            .attr('d', this.linearLine(drawArry));
    }

    /**
     * 绘制播放线段
     * @private
     */
    _drawPlayLine() {
        this._d3Container.select('#playLine').remove();
        let lineX = this._timeToPos(this.playParam.offset);
        this.playLine = this._d3Container.append('line')
            .attr('id', 'playLine')
            .attr('x1', lineX)
            .attr('y1', 0)
            .attr('x2', lineX)
            .attr('y2', this.axisHeight)
            .attr('stroke', '#EF353E')
            .attr('stroke-width', 1 / window.devicePixelRatio);
    }

    /**
     * 创建SVG容器
     * @param container 外部容器Node
     * @private
     */
    _createSVGContainer(container) {
        if (!container) {
            // 没有传入有效的容器
            throw ERR_INFO.DECODE_AUDIO_ERR;
        }

        // 设置容器的宽高
        this.containerWidth = container.clientWidth;
        this.containerHeight = this.axisHeight + this.axisXHeight;

        // 创建容器的样式
        let d3WrapStyle = `width: 100%; height: ${this.containerHeight}px; position: relative; overflow-x: auto; overflow-y: hidden`;
        this._d3Container = d3.select(container).append('div')
            .attr('id', '_d3Wrap')
            .attr('style', d3WrapStyle)
            .append('svg')
            .attr('id', '_d3Container')
            .attr('width', this.containerWidth)
            .attr('height', this.containerHeight)
            .attr('style', `background-color: ${this.coordinatesColor}`);

        this._d3ContainerDom = document.getElementById('_d3Wrap');

        let containerWidth = this.containerWidth;  // 频谱可视区域宽度
        this._step = containerWidth / this.perSeconds;  // 大刻度步长
    }

    /**
     * 重置坐标系
     * @private
     */
    _resetCoordinates() {
        this._d3Container.select('#coordinates').remove();
        // console.log('_resetCoordinates:', this.duration);
        this._timeWidth = this._step * this.duration;   // 音频的宽度
        this._axisWidth = this._timeWidth;   // x轴的宽度
        // 数据音频展示时长不足一屏显示的时长，x轴仍然画一屏
        if (this._timeWidth * this.scale < this.containerWidth) {
            this._axisWidth = this.containerWidth;
        }

        // 缩放时重新设置svg宽度
        let svgWidth = this._axisWidth * this.scale;
        this._d3Container.attr('width', svgWidth);
        let scrollLeft = svgWidth * this._curPointScale - this._offsetX;
        this._d3ContainerDom.scrollLeft = scrollLeft;
        console.log('scrollLeft:', scrollLeft, this._d3ContainerDom.scrollLeft, ', _axisWidth:', this._axisWidth, ', scale:', this.scale, ', _curPointScale:', this._curPointScale, ', _offsetX:', this._offsetX, ', svgWidth:', svgWidth);
    }

    /**
     * 画线性线段
     * @param points 画线数组
     */
    linearLine(points) {
        return d3.line()
            .x(function (d) {
                return d[ 0 ];
            })
            .y(function (d) {
                return d[ 1 ];
            })(points);
    }

    /**
     * 绘制坐标系points
     * @private
     */
    _drawCoordinates() {
        this._resetCoordinates();

        let curTimeWidth = this._timeWidth * this.scale;  // 当前的时长宽度
        let curAxisWidth = curTimeWidth;  // 当前的坐标系宽度
        if (curTimeWidth < this._axisWidth) {
            curAxisWidth = this._axisWidth;
        }
        let duration = this.duration;   // 音频时长
        if (duration < this.perSeconds) {
            duration = this.perSeconds;
        }

        // 设置X轴坐标元素的样式
        // 添加X轴坐标元素
        let coordinates = this._d3Container.append('g')
            .attr('id', 'coordinates')
            .attr('transform', `translate(0, ${this.axisHeight})`)
            .attr('width', curAxisWidth)
            .attr('height', this.axisXHeight);

        coordinates.append('rect')
            .attr('width', curAxisWidth)
            .attr('height', this.axisXHeight)
            .attr('fill', this.axisXColor);

        let time = new Date('2018-12-12 00:00:00').getTime(); // 随便选取个时间的开始，用来格式化标尺x轴刻度
        let containerWidth = this.containerWidth;  // 频谱可视区域宽度

        let axisSticks = [];  // 存放刻度的路径坐标
        let textTop = this.axisXHeight / 2; // 刻度文字的y坐标
        let rulerText = ' 0s';   // x轴刻度文本

        // 获取展示的x轴刻度的值的数组
        let axisX = d3.scaleLinear()
            .domain([ time, time + 1000 * duration ])
            .range([ 0, curAxisWidth ]).ticks(duration);

        for (let i = 0; i < duration; i++) {
            let bx = i * this._step * this.scale;  // 大刻度x轴坐标
            axisSticks.push([ bx, 0 ]);  // 大刻度点
            axisSticks.push([ bx, -20 ]);  // 大刻度的竖线
            axisSticks.push([ bx, 0 ]);
            if (i > 0) {
                rulerText = d3.timeFormat('%M:%S')(axisX[ i ]);
            }

            // 绘制x轴刻度文本
            coordinates.append('text')
                .text(rulerText)
                .attr('transform', `translate(${bx}, ${textTop})`)
                .attr('fill', '#fff')
                .attr('text-anchor', 'middle');

            // 计算小刻度坐标
            for (let j = 1; j < 10; j++) {
                let sx = bx + j * (this._step / 10) * this.scale;  // 小刻度x轴坐标
                axisSticks.push([ sx, 0 ]);
                axisSticks.push([ sx, -10 ]);
                axisSticks.push([ sx, 0 ]);
            }
        }

        // 计算最后一个刻度
        axisSticks.push([ containerWidth, 0 ]);
        axisSticks.push([ containerWidth, -20 ]);
        axisSticks.push([ containerWidth, 0 ]);

        // 绘制x轴和刻度线
        coordinates.append('path')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1 / window.devicePixelRatio)
            .attr('d', this.linearLine(axisSticks));
    }

    /**
     * 事件绑定
     * @private
     */
    _bindEvent() {
        // 监听滚轮事件，放大缩小
        this._d3Container.on('mousewheel', () => {
            let e = window.event;
            let wheel = e.wheelDelta;
            // console.log('mousewheel:', wheel, e, this._d3ContainerDom);
            // 如果在做放大缩小的操作则阻止浏览器默认行为
            if (Math.abs(wheel) > 100) {
                e.preventDefault();

                // 如果正在缩放中，不再进行缩放
                if (this._scaling) {
                    return;
                }
                // 计算当前点在频谱坐标系中的位置比例，用于缩放以当前鼠标点定位
                this._curPointScale = e.offsetX / (this._axisWidth * this.scale);
                this._offsetX = e.offsetX - this._d3ContainerDom.scrollLeft;
                console.log('_curPointScale:', this._curPointScale, e.offsetX, this._d3ContainerDom.scrollLeft, this._axisWidth * this.scale);

                // 滚轮滚动一定距离、允许缩放功能打开、非播放状态时可缩放
                if (wheel < -100) {
                    // console.log('onmousewheel:缩小');
                    if (this.scale <= this.minScale) {
                        console.log('已缩放到最小');
                        return;
                    }
                    this._scaling = true;
                    this.scale -= this.perScale;
                    console.log('scale:', this.scale);

                    // 画频谱
                    this._draw();

                    setTimeout(() => {
                        this._scaling = false;
                    }, 500);
                } else if (wheel > 100) {
                    // console.log('onmousewheel:放大');
                    if (this.scale >= this.maxScale) {
                        console.log('已缩放到最大');
                        return;
                    }
                    this._scaling = true;
                    this.scale += this.perScale;
                    console.log('scale:', this.scale);

                    // 画频谱
                    this._draw();

                    setTimeout(() => {
                        this._scaling = false;
                    }, 500);
                }
            }
        });
    }

    /**
     * 时间转换为位置
     * @param time
     * @private
     */
    _timeToPos(time) {
        let pos = this._timeWidth * this.scale * time / this.duration;
        return pos;
    }
    /**
     * 播放
     * @param when 延迟播放时间，单位为秒（非必填，默认值为0）
     * @param offset 定位音频到第几秒开始播放
     * @param duration 从开始播放到结束时长，当经过设置秒数后自动结束音频播放
     */
    play() {
        console.log('play');
        // 如果播放时长为0，认为是在播放到最后
        let playParam = this.playParam;
        if (playParam.duration === 0) {
            this.playParam.duration = this.duration - playParam.offset;
        }
        let { when, offset, duration } = playParam;
        this.bufferSource = this.context.createBufferSource();  // 创建一个音频源
        this.bufferSource.connect(this.context.destination); // 连接到音频最终输出的目标
        this.bufferSource.buffer = this.buffer;   // 将音频数据传递给音频源
        console.log('buffer:', when, offset, duration);
        let startX = this._timeToPos(offset);     // 开始时间转换为位置
        let endX = this._timeToPos(duration);     // 结束时间转换位置
        this.bufferSource.start(when, offset, duration);  // 播放音频
        this.playLine
            .attr('x1', startX)
            .attr('x2', startX)
            .transition()
            .ease(d3.easeLinear)
            .duration(duration * 1000)
            .attr('x1', endX)
            .attr('x2', endX);

    }

    /**
     * 停止播放
     */
    stop() {
        this.playLine.interrupt();   // 暂停播放线动画
        this.bufferSource && this.bufferSource.stop();   // 停止音频播放
        this.playParam.offset = this.context.currentTime;    // 记录暂停的时间点
    }
}

export default KedAudio;

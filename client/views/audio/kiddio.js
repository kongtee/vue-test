/**
 * Author: hanguangtian
 * Date: 2018/12/09
 * 语音标注工具库
 *
 * 参数：option = {
 *     url: 'http://xxxx.com/xxx.mp3' // 必填项，音频地址
 *     container: node           // 必填项，容器的selector或者node
 * }
 *
 * 例子：
 * let kedAudio = new KedAudio({
 *     url: '',
 * });
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

const BG_HEIGHT = 330;           // 背景SVG高度
const AXIS_HEIGHT = 300;         // 坐标系高度
const AXIS_X_HEIGHT = 30;       // 坐标系X轴高度
const AXIS_COLOR = '#000';       // 坐标系的背景色
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
        this.d3Container = d3.select(option.container);  // 容器转换为d3容器
        this.bgHeight = option.bgHeight || BG_HEIGHT;  // 背景SVG高度
        this.axisHeight = option.axisHeight || AXIS_HEIGHT;  // 坐标系高度
        this.axisXHeight= option.axisXHeight || AXIS_X_HEIGHT;  // 坐标系X轴高度
        this.axisColor = option.axisColor || AXIS_COLOR;  // 坐标系背景色
        this.axisXColor = option.axisXColor || AXIS_X_COLOR;  // 坐标系X轴的背景色
        this.maxScale = option.maxScale || MAX_SCALE;  // 最大放大倍数
        this.minScale = option.minScale || MIN_SCALE;  // 最小缩小倍数
        this.perScale = option.perScale || PER_SCALE;  // 每次缩放的倍数

        // 内部变量
        this.context = null;  // 音频文件上下文环境
        this.buffer = null;   // 音频数据
        this.containerWidth = 0;  // 容器的宽度
        this.containerHeight = 0; // 容器的高度
        this.SVG = null;      // svg容器
        this.SVGWidth = this.containerWidth; // SVG宽度
        this.scale = 1;       // 放大倍数
        this.scaling = false; // 是否在缩放中
        this.axisWidth = 0;   // 坐标系宽度
        this.duration = 10;   // 音频时长
        this.step = 0;   // 大刻度步长

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
        // this._getAudioFile(this.url);
        // 创建SVG容器
        this._createSVGContainer();
        // 绘制坐标系
        this._drawCoordinates();
        // 事件绑定
        this._bindEvent();
    }

    /**
     * 检测是否是可识别的音频文件格式
     * @param url
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
                console.log('status:', request.status, request.response);
                if ((request.status >= 200 && request.status < 300) || request.status === 304) {
                    let audioData = request.response.slice(0);
                    this._getAudioData(audioData);
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
                fileReader.readAsArrayBuffer(file); // 读取本地文件
            } catch (e) {
                throw ERR_INFO.READ_FILE_ERR;
            }
        }
    }

    /**
     * 获取音频数据
     * @param data
     * @private
     */
    _getAudioData(data) {
        console.log('_getAudioData:', data);
        this.context.decodeAudioData(data, buffer => {
            // 解码音频文件，获得文件信息
            this.buffer = buffer;
        }, function (e) {
            //这个是解码失败
            throw ERR_INFO.DECODE_AUDIO_ERR;
        });
    }

    /**
     * 创建SVG容器
     * @private
     */
    _createSVGContainer() {
        if (!this.d3Container) {
            // 没有传入有效的容器
            throw ERR_INFO.DECODE_AUDIO_ERR;
        }

        // 设置容器的样式
        let containerStyle = 'width: 100%; height: 330px; position: relative; overflow-x: auto; overflow-y: hidden';
        this.d3Container.attr('style', containerStyle);

        // 设置容器的宽高
        this.containerWidth = this.container.clientWidth;
        this.containerHeight = this.container.clientHeight;

        this.duration = 15;

        let containerWidth = this.containerWidth;  // 频谱可视区域宽度
        this.step = containerWidth / 10;  // 大刻度步长
        this.axisWidth = this.step * this.duration;   // x轴的宽度
    }

    /**
     * 重置坐标系
     * @private
     */
    _resetCoordinates() {
        this.d3Container.select('#coordinates').remove();
        // d3.selectAll('#axisBackGround').remove();
        // this.axisWidth = this.container.clientWidth * this.scale / this.maxScale;
        // d3.selectAll('#axisBox').attr('style', `width: ${this.axisWidth}px`); //更改坐标轴处触发滚动div的宽度
        //
        // this.SVG.append("rect")
        //     .attr("fill", this.axisXColor)
        //     .attr("x", 0)
        //     .attr("width", this.container.clientWidth)
        //     .attr("y", this.axisHeight)
        //     .attr('height', this.axisXHeight)
        //     .attr('id', 'axisBackGround');
    }

    /**
     * 画线性线段
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

        console.log('this.d3Container:', this.d3Container);

        let coordinates = this.d3Container.append('svg')
            .attr('id', 'coordinates')
            .attr('width', this.axisWidth * this.scale)
            .attr('height', this.containerHeight);

        let time = new Date('2018-12-12 00:00:00').getTime(); // 随便选取个时间的开始，用来格式化标尺x轴刻度
        let containerWidth = this.containerWidth;  // 频谱可视区域宽度

        let axisSticks = [];  // 存放刻度的路径坐标
        let axisHeight = this.axisHeight;  // 频谱区域高度
        let textTop = axisHeight + this.axisXHeight / 2; // 刻度文字的y坐标
        let rulerText = ' 0s';   // x轴刻度文本

        // 获取展示的x轴刻度的值的数组
        let axisX = d3.scaleLinear()
            .domain([ time, time + 1000 * this.duration ])
            .range([ 0, this.axisWidth ]).ticks(this.duration);
        console.log(this.duration, this.axisWidth, axisX);

        console.log('scale:', this.scale);
        for (let i = 0; i < this.duration; i++) {
            let bx = i * this.step * this.scale;  // 大刻度x轴坐标
            axisSticks.push([ bx, axisHeight ]);  // 大刻度点
            axisSticks.push([ bx, axisHeight - 20 ]);  // 大刻度的竖线
            axisSticks.push([ bx, axisHeight ]);
            if (i > 0) {
                rulerText = d3.timeFormat('%M:%S')(axisX[ i ]);
            }

            // 绘制x轴刻度文本
            coordinates.append('text')
                .text(rulerText)
                .attr('x', bx)
                .attr('y', textTop)
                .attr('fill', '#fff')
                .attr('text-anchor', 'middle');

            // 计算小刻度坐标
            for (let j = 1; j < 10; j++) {
                let sx = bx + j * (this.step / 10) * this.scale;  // 小刻度x轴坐标
                axisSticks.push([ sx, axisHeight ]);
                axisSticks.push([ sx, axisHeight - 10 ]);
                axisSticks.push([ sx, axisHeight ]);
            }
        }

        // 计算最后一个刻度
        axisSticks.push([ containerWidth, axisHeight ]);
        axisSticks.push([ containerWidth, axisHeight - 20 ]);
        axisSticks.push([ containerWidth, axisHeight ]);

        // 绘制x轴和刻度线
        coordinates.append('path').attr('stroke', '#fff').attr('stroke-width', 1 / window.devicePixelRatio).attr('d', this.linearLine(axisSticks));
    }

    /**
     * 事件绑定
     * @private
     */
    _bindEvent() {
        // 监听滚轮事件，放大缩小
        this.d3Container.on('mousewheel', () => {
            let e = window.event;
            e.preventDefault();
            let wheel = e.wheelDelta;
            console.log('mousewheel:', wheel);
            //滚轮滚动一定距离、允许缩放功能打开、非播放状态时可缩放
            // if (wheel < -100 && that.mouseScrollState && !that.play) {
            if (wheel < -100 && !this.scaling) {
                console.log('onmousewheel:缩小');
                if (this.scale <= this.minScale) {
                    console.log('已缩放到最小');
                    return;
                }
                this.scaling = true;
                this.scale -= this.perScale;

                this._drawCoordinates();

                setTimeout(() => {
                    this.scaling = false;
                }, 500);
            } else if (wheel > 100 && !this.scaling) {
                console.log('onmousewheel:放大');
                if (this.scale >= this.maxScale) {
                    console.log('已缩放到最大');
                    return;
                }
                this.scaling = true;
                this.scale += this.perScale;

                this._drawCoordinates();

                setTimeout(() => {
                    this.scaling = false;
                }, 500);
            }
        });
    }
}

export default KedAudio;

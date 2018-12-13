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


let ddd = d3.line()
    .x(function (d) {
        return d.x;
    })
    //   获取每个节点的y坐标
    .y(function (d) {
        return d.y;
    });

class KedAudio {
    constructor(option) {
        // 初始化参数
        this.url = option.url;  // 音频地址。
        this.container = option.container;  // 容器标签
        this.bgHeight = option.bgHeight || BG_HEIGHT;  // 背景SVG高度
        this.axisHeight = option.axisHeight || AXIS_HEIGHT;  // 坐标系高度
        this.axisXHeight = option.axisXHeight || AXIS_X_HEIGHT;  // 坐标系X轴高度
        this.axisColor = option.axisColor || AXIS_COLOR;  // 坐标系背景色
        this.axisXColor = option.axisXColor || AXIS_X_COLOR;  // 坐标系X轴的背景色
        this.maxScale = option.maxScale || MAX_SCALE;  // 最大放大倍数

        // 内部变量
        this.context = null;  // 音频文件上下文环境
        this.buffer = null;   // 音频数据
        this.containerWidth = 0;  // 容器的宽度
        this.containerHeight = 0; // 容器的高度
        this.SVG = null;      // svg容器
        this.SVGWidth = this.containerWidth; // SVG宽度
        this.scale = 1;       // 放大倍数
        this.axisWidth = 0;   // 坐标系宽度

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
        let container = this.container;
        let drawContainer = d3.select(container);

        if (!drawContainer) {
            // 没有传入有效的容器
            throw ERR_INFO.DECODE_AUDIO_ERR;
        }

        // 设置容器的宽高
        this.containerWidth = container.clientWidth;
        this.containerHeight = container.clientHeight;

        this.SVG = drawContainer.append('svg')
            .attr('width', this.containerWidth)
            .attr('height', this.containerHeight);
    }

    /**
     * 重置坐标系
     * @private
     */
    _resetCoordinates() {
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

    _line(points) {
        d3.line(points)
            .x(function (d) {
                return d.x;
            })
            //   获取每个节点的y坐标
            .y(function (d) {
                return d.y;
            });
    }

    /**g
     * 绘制坐标系points
     * @private
     * @param duration 时长
     */
    _drawCoordinates(duration) {
        this._resetCoordinates();

        let time = new Date('2018-12-12 00:00:00').getTime();

        let axisX = d3.scaleLinear()
            .domain([ time + 1000 * 0, time + 1000 * 10 ])
            .range([ 0, this.containerWidth ]).ticks(10);
        console.log('axisX:', axisX);
        //
        // let axisXTicks = d3.ticks(0, 10, 100); // 画X轴需要的点的数组
        // console.log('axisXTicks:', axisXTicks);

        // for (let i = 0; i < )
        let axisSticks = [
            { x: 0, y: 300 },
            { x: 1000, y: 300 }
        ];

        this.SVG.append('path').attr('fill', '#fff').attr('fill-width', '0.5').attr('d', ddd(axisSticks));

        // this.SVG.append('g')
        //     .attr('transform', 'translate(0,' + this.axisHeight + ')')
        //     .call(d3.axisBottom(axisX).tickFormat(d3.timeFormat('%M:%S')).tickSizeInner(10));
        //
        // this.SVG.append('text').text('sddd').attr('x', 35).attr('y', this.axisHeight + this.axisXHeight / 2).attr('text-anchor', 'middle').attr('fill', '#fff').attr('fontSize', '20px')
        // let axisarr = [];
        // let perSecondPx = trueWidth * this.scale / seconds * ticks;
        //
        // let j = 0;
        //
        // for (let i = 0; i < end;) {
        //     if (j % 10 === 0) {
        //         j = 1;
        //         axisarr.push([ i, height ]);
        //         axisarr.push([ i, height - 20 ]);
        //         axisarr.push([ i, height ]);
        //         if (i === 0) {
        //             svg.append('text').text('s').attr('x', i + 5).attr('y', height + axisHeight / 2).attr('text-anchor', 'middle').attr('class', 'axisText').attr('fill', color)
        //         } else {
        //             if (end - i > 0.2 * perSecondPx) { // 末尾至少能够多显示0.2s，才显示刻度值
        //                 svg.append('text').text(changeForm(Math.round(i / perSecondPx))).attr('x', i).attr('y', height + axisHeight / 2).attr('text-anchor', 'middle').attr('class', 'axisText').attr('fill', color)
        //             }
        //         }
        //     } else {
        //         axisarr.push([ i, height ]);
        //         axisarr.push([ i, height - 10 ]);
        //         axisarr.push([ i, height ]);
        //         j++;
        //     }
        //     i += perSecondPx / 10;
        // }
        // axisarr.push([ width, height ]);
        // svg.append('path').attr('stroke', color).attr('stroke-width', '0.5').attr('fill', color).attr('d', lineGenerator(axisarr));
    }
}

export default KedAudio;

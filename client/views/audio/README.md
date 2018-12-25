# 语音标注工具库
Author: hanguangtian
Date: 2018/12/09

## 一、参数：

```
option = {
    url: 'http://xxxx.com/xxx.mp3' // 必填项，音频地址
    container: node           // 必填项，容器的selector或者node
    axisHeight: number        // 选填，频谱图区域高度，默认值 250
    axisXHeight: number       // 选填，x轴区域高度，默认值 30
    coordinatesColor: color   // 选填，频谱图区域(坐标系)背景色，默认值 #000
    frequencyColor: color     // 选填，频谱颜色，默认值 #56dda2
    axisXColor: color         // 选填，坐标系X轴背景色，默认值 #424242
    maxScale: number          // 选填，最大放大倍数，默认值 10
    perSeconds: number        // 选填，每屏显示秒数，默认值 10
}
```



## 二、例子：
### 1.基础：
```
let kedAudio = new KedAudio({
    url: '',
    container: this.$refs[ 'audioContainer' ]
});
```



### 2.选填：
```
let kedAudio = new KedAudio({
    url: '',
    container: this.$refs[ 'audioContainer' ],
    axisHeight: 350,
    axisXHeight: 30,
    coordinatesColor: '#000',
    frequencyColor: '#56dda2',
    axisXColor: '#424242’，
    maxScale: 10，
    perSeconds: 10
});
```



## 三、方法：
###1.play()：播放功能

#### 参数：

when 延迟播放时间，单位为秒（非必填，默认值为0）

offset 定位音频到第几秒开始播放

duration 从开始播放结束时长，当经过设置秒数后自动结束音频播放

#### 例子：

## 四、属性

1.url ：// 音频地址。

2.container： // 容器标签

3.axisHeight： // 坐标系高度

4.axisXHeight:  // 坐标系X轴高度

5.coordinatesColor:  // 坐标系背景色

6.frequencyColor:   // 频谱颜色

7.axisXColor:   // 坐标系X轴的背景色

8.maxScale:    // 最大放大倍数

9.minScale:     // 最小缩小倍数

10.perScale:   // 每次缩放的倍数

11.context:     // 音频文件上下文环境

12.buffer:    // 音频数据

13.containerWidth:   // 容器的宽度

14.containerHeight:  // 容器的高度

15.scale:  // 放大倍数

16.duration:   // 音频时长

17.playLine:   // 播放线


/**
 * 获取地址栏参数
 */

export default {
    get: function (key) {
        const href = window.location.href;
        let param = href.substring(href.indexOf('?') + 1);
        const index = param.indexOf('#');
        if (index >= 0) {
            param = param.substring(0, index);
        }
        const arr = param.split('&');
        const len = arr.length;
        let paramArr = [];

        for (let i = 0; i < len; i++) {
            const tmpArr = arr[i].split('=');
            paramArr[tmpArr[0]] = arr[i].substring(arr[i].indexOf('=') + 1, arr[i].length);
        }

        return paramArr[key];
    }
};

/**
 * @file request.js
 * @desc node对外http请求服务
 */
const superagent = require('superagent');
const api = require('./api');

/**
 * @param {Object} options 请求对象;
 * @param {string} [options.host] 请求的host
 * @param {string} [options.uri] 请求的url search不分
 * @param {string} [options.method] 请求的方法暂时仅支持post和get
 * @param {Object} [options.headers] 请求的header对象
 * @param {Object} [options.data] 请求参数数据
 * @param {Object} http 请求宿主http对象
 * @returns {Promise}
 */
const send = (options, http) => {
    let deferred = think.defer();
    const sTime = Date.now();
    const url = options.host + options.uri;
    const method = (options.method || 'post').toLowerCase();
    const params = method == 'post' ? 'send' : 'query';
    console.log('send -> url:', url);
    options.headers = options.headers || {};
    // console.log('logid:', http.headers.logid);
    // options.headers.flowid = http.headers.logid;

    superagent
        [method](url)
        [params](options.data || {})
        .set(options.headers)
        .timeout(options.timeout || 2924830)
        .end(function (err, res) {
            console.log('request -> response:', err, res);
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(res.body);
            }
            try {
                const rspHeader = JSON.parse(res.text).RspHeader;
                console.log('request:', rspHeader);
            } catch (e) {
                // http.logger('warn', e);
            }
            // http && http.addLog('service:' + options.uri, {
            //   url: url,
            //   time: Date.now() - sTime,
            //   status: res && res.status,
            //   FlowId: res && res.header && res.header.flowid || '0',
            //   RspHeader: rspHeader
            // });
        });
    return deferred.promise;
};

/**
 * @desc 对api封装，配合对外提供快捷的http server请求
 * @example [CONST_URI]({....}) 即发送对应接口服务，返回参数
 *   const send = think.service('request');
 *   try {
 *       var reqText = await send.QUAER_HOME_PAGEINFO({
 *           data: {"QueryStartPos": 0, "QueryNumber": 20, "ContainVod": 0, "QueryType": 2}
 *       }, self.http);
 *
 *   }
 *   catch (e) {
 *       console.log(e);
 *
 *   }
 * @returns {Object}
 */
const request = {};
Object.keys(api).forEach(function (value, index) {
    request[value] = async function (options, http) {
        const uri = options.type === 'rest' ? (api[value] + options.uri) : api[value];
        options.uri = uri;
        return await send(options, http);
    };
});

module.exports = request;

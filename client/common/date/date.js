/**
 * 日期格式化
 *
 *  var time1 = new Date().Format("yyyy-MM-dd");
 *	var time2 = new Date().Format("yyyy-MM-dd hh:mm:ss");
 *
 */

Date.prototype.Format = function(fmt) { //author: meizz
	const o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (let k in o) {
		if (new RegExp("(" + k + ")").test(fmt))  {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};

/**
 * 去查询日期区间，开始日期的00：00到结束日期的23:59。
 * @param begin 开始时间相对于今天的天数 -1 为昨天，0 今天， 1 明天 ，类推
 * @param end 结束时间相对于今天的天数
 * @returns {[*,*]} 返回值为一个数组，0：开始时间getTime()值，1：结束时间getTime()值。单位为秒。
 * @constructor
 *
 * ex:
 * (new Date()).Range(-7, 0);  取最近7天的时间。
 */
Date.prototype.Range = function(begin, end) {
    let beginDate = Object.assign(new Date(this));
    let endDate = Object.assign(new Date(this));
    endDate = new Date(endDate.setDate(endDate.getDate() + end + 1));
    beginDate = new Date(beginDate.setDate(beginDate.getDate() + begin));
    let bDate = beginDate.getFullYear() + '-' + (beginDate.getMonth() + 1) + '-' + beginDate.getDate();
    let eDate = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();

    return [
    	(new Date(bDate)).getTime() / 1000,
		(new Date(eDate)).getTime() / 1000 - 1
	];
};

/**
 * 获取该时间的00:00:00。
 *
 * ex:
 * date.Begin();
 */
Date.prototype.Begin = function() {
	const beginDate = new Date(this);
    const bDate = beginDate.getFullYear() + '-' + (beginDate.getMonth() + 1) + '-' + beginDate.getDate() + ' 00:00:00';
    return (new Date(bDate)).getTime() / 1000;
};

/**
 * 获取该时间的23:59:59。
 *
 * ex:
 * date.End();
 */
Date.prototype.End = function() {
    const endDate = new Date(this);
    const eDate = endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate() + ' 23:59:59';
    return (new Date(eDate)).getTime() / 1000;
};

export default Date;

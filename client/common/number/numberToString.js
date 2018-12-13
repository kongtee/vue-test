/**
 * Created by hanguangtian on 16/9/5.
 * 数字转换为字符串
 */
export default {
    /**
     * 数字转化为末尾是"万"的字符串
     * @param num
     * @returns {*}
     */
    toTenThousand: function (num) {
        let result = num;
        if (num > 9999) {
            result = (num / 10000).toFixed(2) + 'w';
        }

        return result;
    },
    /**
     * 数字转化为国际标准形式(3位加一个逗号)
     * @param num
     * @returns {*}
     */
    toStandard: function (num) {
        num = num === 0 ? '0' : num;
        return (num || '').toString().replace(/(?=(?!\b)(?:\d\d\d)+(?!\d))/g, ',');
    },
    /**
     * 手机号码格式化为 xxx-xxxx-xxxx格式
     * @param phone
     */
    toPhoneNum: function (phone) {
        return phone.replace(/(\d\d\d)(\d\d\d\d)(\d\d\d\d)/g, '$1-$2-$3');
    },
     /**
     * 把数字装换成百分数
     * @param num
     */
    toPercent(num){
        num = num - 0;
        if((typeof num)=='number' && num==num){
            num = (100*num).toFixed(2);
            return num +'%';
        }
        else{
            return ""
        }
    },

};

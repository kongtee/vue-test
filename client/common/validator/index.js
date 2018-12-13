export default {
    // 验证真实姓名
    trueNameValidator(rule, value, callback) {
        if (!value) {
            callback(new Error('请输入真实姓名'));
        } else if (value.length > 10) {
            callback(new Error('不超过10字符'));
        } else {
            callback();
        }
    },
    // 验证手机号
    phoneValidator(rule, value, callback, { phone }) {
        if (!value) {
            callback(new Error('请填写手机号码'));
        } else if (phone && value && value === phone) {
            callback(new Error('您输入的号码与原手机号码相同'));
        } else if (!/^1\d{10}$/.test(value)) {
            callback(new Error('手机号码格式不正确'));
        } else {
            callback();
        }
    },
    // 验证验证码
    msgCodeValidate(rule, value, callback, { msgCode }) {
        if (!value) {
            callback(new Error('请获取并输入正确验证码'));
        } else if (value && value === msgCode) {
            callback(new Error('请获取并输入正确验证码'));
        } else {
            callback();
        }
    }
};

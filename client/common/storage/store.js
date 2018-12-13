/**
 * Created by mac on 2016/11/29.
 * @file common/store.js
 * @author @zhangjianguang
 * @desc 本地存储封装
 */

var prefix = 'KEYE_';

var storage = window.localStorage;

var disable = false;
try {
    storage['try'] = 'try';
    if (storage['try']) {
        storage.removeItem('try');
    } else {
        disable = true;
    }
} catch (e) {
    disable = true;
    console.log('浏览器不支持localStorage存储');
}

// var isJSON = function(str) {
//     try {
//         JSON.parse(str);
//     } catch (e) {
//         return false;
//     }
//     return true;
// };

var store = {
    get: function(name, key) {
        name = prefix + name;
        if (disable) {
            return null;
        }
        var data = storage.getItem(name);
        if (typeof data == 'undefined') return false;
        try {
            data = JSON.parse(data);
            if (key) {
                return data[key];
            } else {
                return data;
            }
        } catch (e) {
            return data;
        }
    },
    set: function(name, data, value) {
        var _name = prefix + name;
        if (disable) {
            return null;
        }
        if (arguments.length === 2) {
            storage.setItem(
                _name,
                typeof data === 'object' ? JSON.stringify(data) : data
            );
        }
        if (arguments.length === 3) {
            var _data = store.get(name) || {};
            var key = data;
            _data[key] = value;
            storage.setItem(_name, JSON.stringify(_data));
        }
    },
    remove: function(name, key) {
        var _name = prefix + name;
        if (disable) {
            return null;
        }
        if (arguments.length === 1) {
            storage.removeItem(_name);
        }
        if (arguments.length === 2) {
            var _data = store.get(name);
            delete _data[key];
            store.set(name, _data);
        }
    },

    has: function(name) {
        name = prefix + name;
        if (disable) {
            return null;
        }
        return storage.getItem(name) !== null;
    },

    clear: function() {
        if (disable) {
            return null;
        }
        storage.clear();
    }
};

export default store;

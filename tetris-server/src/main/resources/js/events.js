define([], function () {

    var Event = {
        // 通过on接口监听事件eventName
        // 如果事件eventName被触发，则执行callback回调函数
        on: function (eventName, callback) {
            if (!this.handles) {
                Object.defineProperty(this, "handles", {
                    value: {},
                    enumerable: false,
                    configurable: true,
                    writable: true
                })
            }

            if (!this.handles[eventName]) {
                this.handles[eventName] = [];
            }
            this.handles[eventName].push(callback);
        },
        off: function (eventName, callback) {
            if (this.handles) {
                if (this.handles[eventName] instanceof Array) {
                    var len = this.handles[eventName].length;
                    if (callback) {
                        for (var i = 0; i < len; i++) {
                            if (this.handles[eventName][i] === callback) {
                                break;
                            }
                        }
                        this.handles[eventName].splice(i, 1);
                    } else { // 移除所有
                        this.handles[eventName].splice(0, len);
                    }
                }
            }
        },
        // 触发事件 eventName
        emit: function (eventName) {
            if (this.handles) {
                if (this.handles[arguments[0]]) {
                    for (var i = 0; i < this.handles[arguments[0]].length; i++) {
                        this.handles[arguments[0]][i](arguments[1]);
                    }
                }
            }
        }
    };

    // 测试1
    /*
     Event.on('test', function (result) {
        console.log(result);
     });
     Event.on('test', function () {
        console.log('test');
     });
     Event.emit('test', 'hello world'); // 输出 'hello world' 和 'test'
     */

    return {
        Event: Event
    };
});


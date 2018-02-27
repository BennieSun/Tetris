define(['events'], function (events) {

    /*
    // Server to Client
    var first = {
        type : "UUID", // 第一个消息,发送uuid给客户端
        data : "(uuid)"
    };
    // Client to Server
    var msg = {
        uuid : "客户端唯一标识",
        type : "事件类型",
        data : "文本" 或 {
            attr1: value1,
            attr2: value2,
        }
    };
    */

    var Socket = function () {
        // WebSocket
        var socket;
        // ClientID
        var UUID;

        // Events
        var event = events.Event;

        var onmessage = function (e) {
            console.log("收到消息..." + e.data);
            if (typeof e.data === "string") {
                var msg = JSON.parse(e.data.toString());
                if (msg && msg.type) {
                    if (msg.type == 'UUID') { // 第一个消息,服务端发送UUID给客户端
                        UUID = msg.data; // 获取客户端唯一标识
                    } else {
                        event.emit(msg.type, msg.data);
                    }
                }
            } else {
                event.emit('error', {msg: "非文本消息,暂不处理."});
            }
        };

        var onopen = function (e) {
            console.log("已连接到服务器...");
            event.emit('conn', {msg: 'OK'});
        };

        var onclose = function (e) {
            console.log("连接已断开.");
            event.emit('close', {msg: 'OK'});
        };

        var onerror = function (e) {
            console.log("连接出错.");
            event.emit('error', {msg: e});
        };

        var send = function (type, args) {
            if (socket && socket.readyState == WebSocket.OPEN) {
                var pack = {
                    uuid: UUID, // 加上客户端的唯一标识
                    type: type,
                    data: args
                };

                socket.send(JSON.stringify(pack));
            } else {
                event.emit('close', {msg: 'OK'});
            }
        };

        var close = function () {
            if (socket) {
                socket.close();
            }
        };

        var on = function (type, callback) {
            event.on(type, callback);
        };

        var off = function (type) {
            event.off(type, arguments[0]);
        };

        // connect to server
        var connect = function (url) {
            try {
                socket = new WebSocket(url);
                socket.onopen = onopen;
                socket.onmessage = onmessage;
                socket.onclose = onclose;
                socket.onerror = onerror;
            } catch (e) {
                console.log(e.data.toString());
                event.emit('error', {msg: e});
            }
        };

        this.connect = connect;
        this.send = send;
        this.on = on;
        this.off = off;
        this.close = close;
    };

    return {
        Socket: Socket
    };
});


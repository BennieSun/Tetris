define(['local','remote','socket'], function (local,remote,socket) {

    return {
        run : function(){
            var sock = new socket.Socket();
            new local.Local(sock);
            new remote.Remote(sock);
            sock.connect("ws://localhost:8888/tetris");
        }
    };
});


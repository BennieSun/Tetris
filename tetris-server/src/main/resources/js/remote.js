define(['jquery', 'game'], function ($, game) {

    var Remote = function (socket) {
        var remoteGame;

        // 开始
        var start = function (type, index) {
            var args = {
                doms: {
                    gameDiv: $('#remote_game'),
                    nextDiv: $('#remote_next'),
                    time: $('#remote_time'),
                    score: $('#remote_score'),
                    result: $('#remote_result')
                },
                type: type,
                index: index
            };

            remoteGame = new game.Game();
            remoteGame.init(args);
        };

        // socket events

        socket.on('init', function (data) {
            start(data.type, data.index);
        });
        socket.on('next', function (data) {
            remoteGame.generateNext(data.type, data.index);
        });
        socket.on('rotate', function (data) {
            remoteGame.rotate();
        });
        socket.on('right', function (data) {
            remoteGame.right();
        });
        socket.on('down', function (data) {
            remoteGame.down();
        });
        socket.on('left', function (data) {
            remoteGame.left();
        });
        socket.on('fall', function (data) {
            remoteGame.fall();
        });
        socket.on('fixed', function (data) {
            remoteGame.fixed();
        });
        socket.on('lines', function (data) {
            remoteGame.checkClear();
            remoteGame.addScore(data);
        });
        socket.on('time', function (data) {
            remoteGame.setTime(data);
        });
        socket.on('over', function (data) {
            remoteGame.gameOver(data);
        });
        socket.on('tails', function (data) {
            remoteGame.addTails(data);
        });
    };

    // 导出
    return {
        Remote: Remote
    };
});
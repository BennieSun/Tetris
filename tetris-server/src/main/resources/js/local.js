define(['jquery', 'game'], function ($, game) {

    var Local = function (socket) {

        var localGame;
        var interval = 200;
        var timer;
        var millSec;

        // bindKeyEvent
        var bindKeyEvent = function () {
            $('body').bind('keydown', function (e) {
                if (e.keyCode == 38 || e.keyCode == 87) { // up, W
                    localGame.rotate();
                    socket.send('rotate', {});
                } else if (e.keyCode == 39 || e.keyCode == 68) { // right, D
                    localGame.right();
                    socket.send('right', {});
                } else if (e.keyCode == 40 || e.keyCode == 83) { // down, S
                    localGame.down();
                    socket.send('down', {});
                } else if (e.keyCode == 37 || e.keyCode == 65) { // left, A
                    localGame.left();
                    socket.send('left', {});
                } else if (e.keyCode == 32) { // space
                    localGame.fall();
                    socket.send('fall', {});
                }
            });
        };

        // genNext
        var genNext = function () {
            return {
                type: Math.ceil(Math.random() * 7),
                index: Math.ceil(Math.random() * 4) - 1
            }
        };

        // move
        var move = function () {
            millSec += interval;
            localGame.setTime(millSec);
            // 每30秒生成一行干扰行
            if (millSec % 1000 == 0) {
                socket.send('time', millSec);
            }
            //
            if (!localGame.down()) {
                localGame.fixed();
                socket.send('fixed', {});
                var lines = localGame.checkClear();
                if (lines > 0) {
                    localGame.addScore(lines);
                    socket.send('lines', lines);
                }
                var gameover = localGame.checkGameOver();
                if (gameover) {
                    localGame.gameOver(false);
                    socket.send('over', false);
                    $('#remote_result').text("你赢了!");
                    stop();
                } else {
                    var next = genNext();
                    localGame.generateNext(next.type, next.index);
                    socket.send('next', next);
                }
            } else {
                socket.send('down', {});
            }
        };

        // 开始
        var start = function () {
            var next = genNext();
            var args = {
                doms: {
                    gameDiv: $('#local_game'),
                    nextDiv: $('#local_next'),
                    time: $('#local_time'),
                    score: $('#local_score'),
                    result: $('#local_result')
                },
                type: next.type,
                index: next.index
            };

            localGame = new game.Game();
            localGame.init(args);
            socket.send('init', next);

            bindKeyEvent();

            next = genNext();
            localGame.generateNext(next.type, next.index);
            socket.send('next', next);

            millSec = 0;
            timer = setInterval(move, interval);
        };

        // stop
        var stop = function () {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            $('body').unbind('keydown');
        };

        // socket events

        socket.on('conn', function (data) {
            console.log(data.msg);
        });

        socket.on('wait', function () {
            $('#wait').text("等待其他玩家加入...");
        });

        socket.on('start', function () {
            $('#wait').text("");
            start();
        });

        // 收到对方的over消息,说明我们获胜了
        socket.on('over', function (data) {
            localGame.gameOver(true);
            stop();
        });
        // 收到对方的消行消息,增加我方的干扰行
        socket.on('lines', function (data) {
            if (data > 1) {
                var tails = [];
                for (var j = 0; j < (data - 1); j++) {
                    var tail = [];
                    for (var n = 0; n < 10; n++) {
                        tail.push(Math.ceil(Math.random() * 2) - 1);
                    }
                    tails.push(tail);
                }

                localGame.addTails(tails);
                socket.send('tails', tails);
            }
        });
        // 对方掉线
        socket.on('leave',function (data) {
            $('#local_result').text("对手掉线")
            $('#remote_result').text("已掉线!");
            stop();
        });
    };

    // 导出
    return {
        Local: Local
    };
});
define(['jquery', 'square', 'squareFactory'], function ($, square, squareFactory) {

    var Game = function () {
        // 界面
        var gameContainer;
        var nextContainer;
        // 游戏地图
        var gameData = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        // 当前方块和下一个方块
        var cur;
        var next;
        // divs
        var gameDivs = [];
        var nextDivs = [];
        // 时间\得分\结果
        var time;
        var score;
        var scoreCount = 0;
        var result;
        // 初始化Div
        var initDiv = function (data, divs, container) {
            addScore(); // reset
            for (var i = 0; i < data.length; i++) {
                var subDivs = [];
                for (var j = 0; j < data[0].length; j++) {
                    var node = $('<div></div>');
                    node.addClass("none");
                    node.css("top", (i * 20) + "px");
                    node.css("left", (j * 20) + "px");
                    container.append(node);
                    subDivs.push(node);
                }
                divs.push(subDivs);
            }
        };
        // Check
        var check = function (pos, x, y) {
            if ((pos.x + x < 0) || pos.x + x >= gameData.length
                || pos.y + y < 0 || pos.y + y >= gameData[0].length
                || gameData[pos.x + x][pos.y + y] == 1) {
                return false;
            } else {
                return true;
            }
        };
        // isValid
        var isValid = function (pos, data) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[0].length; j++) {
                    if (data[i][j] != 0) {
                        if (!check(pos, i, j)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        // SetData
        var setData = function (src, reset) {
            for (var i = 0; i < src.data.length; i++) {
                for (var j = 0; j < src.data[0].length; j++) {
                    if (check(src.origin, i, j)) {
                        gameData[src.origin.x + i][src.origin.y + j] = reset ? 0 : src.data[i][j];
                    }
                }
            }
        };
        // 刷新Div
        var refreshDiv = function (data, divs) {
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[0].length; j++) {
                    divs[i][j].removeClass();
                    if (data[i][j] == 0) {
                        divs[i][j].addClass("none");
                    } else if (data[i][j] == 1) {
                        divs[i][j].addClass("done");
                    } else if (data[i][j] == 2) {
                        divs[i][j].addClass("current");
                    }
                }
            }
        };
        // 初始化
        var init = function (args) {
            //console.log("init Game");
            time = args.doms.time;
            score = args.doms.score;
            result = args.doms.result;
            gameContainer = args.doms.gameDiv;
            nextContainer = args.doms.nextDiv;
            next = squareFactory.make(args.type, args.index);
            initDiv(gameData, gameDivs, gameContainer);
            initDiv(next.data, nextDivs, nextContainer);
            refreshDiv(next.data, nextDivs);
        };
        // down
        var down = function () {
            if (cur.canMove(square.Direction.DOWN, isValid)) {
                setData(cur, true);
                cur.move(square.Direction.DOWN);
                setData(cur);
                refreshDiv(gameData, gameDivs);
                return true;
            } else {
                return false;
            }
        };
        // left
        var left = function () {
            if (cur.canMove(square.Direction.LEFT, isValid)) {
                setData(cur, true);
                cur.move(square.Direction.LEFT);
                setData(cur);
                refreshDiv(gameData, gameDivs);
            }
        };
        // right
        var right = function () {
            if (cur.canMove(square.Direction.RIGHT, isValid)) {
                setData(cur, true);
                cur.move(square.Direction.RIGHT);
                setData(cur);
                refreshDiv(gameData, gameDivs);
            }
        };
        // rotate
        var rotate = function () {
            if (cur.canRotate(isValid)) {
                setData(cur, true);
                cur.rotate();
                setData(cur);
                refreshDiv(gameData, gameDivs);
            }
        };
        // fixed
        var fixed = function () {
            for (var i = 0; i < cur.data.length; i++) {
                for (var j = 0; j < cur.data[0].length; j++) {
                    if (check(cur.origin, i, j)) {
                        if (gameData[cur.origin.x + i][cur.origin.y + j] == 2)
                            gameData[cur.origin.x + i][cur.origin.y + j] = 1;
                    }
                }
            }
            refreshDiv(gameData, gameDivs);
        };
        // checkClear
        var checkClear = function () {
            var lines = 0;
            for (var i = gameData.length - 1; i >= 0; i--) {
                var clear = true;
                for (var j = 0; j < gameData[0].length; j++) {
                    if (gameData[i][j] != 1) {
                        clear = false;
                        break;
                    }
                }
                if (clear) {
                    lines++;
                    for (var m = i; m > 0; m--) {
                        for (var n = 0; n < gameData[0].length; n++) {
                            gameData[m][n] = gameData[m - 1][n];
                        }
                    }
                    for (var k = 0; k < gameData[0].length; k++) {
                        gameData[0][k] = 0;
                    }
                    i++;
                }
            }
            return lines;
        };
        // checkGameOver
        var checkGameOver = function () {
            var gameOver = false;
            for (var i = 0; i < gameData[0].length; i++) {
                if (gameData[0][i] == 1) {
                    gameOver = true;
                    break;
                }
            }
            return gameOver;
        };
        // generateNext
        var generateNext = function (type, index) {
            cur = next;
            setData(cur);
            next = squareFactory.make(type, index);
            refreshDiv(gameData, gameDivs);
            refreshDiv(next.data, nextDivs);
        };
        // setTime
        var setTime = function (t) {
            var seconds = Math.floor(t / 1000);
            var minutes = Math.floor(seconds / 60);
            seconds = seconds >= 60 ? seconds % 60 : seconds;
            var hours = Math.floor(minutes / 60);
            minutes = minutes >= 60 ? minutes % 60 : minutes;
            var timeFmt = seconds < 10 ? "0" + seconds : seconds;
            if (minutes > 0) {
                timeFmt = (minutes < 10 ? "0" + minutes : minutes) + ":" + timeFmt;
            }
            if (hours > 0) {
                timeFmt = (hours < 10 ? "0" + hours : hours) + ":" + timeFmt;
            }
            time.text(timeFmt);
        };
        // addScore
        var addScore = function (s) {
            if (!s) { // reset
                scoreCount = 0;
            }
            switch (s) {
                case 1:
                    scoreCount += 10;
                    break;
                case 2:
                    scoreCount += 30;
                    break;
                case 3:
                    scoreCount += 60;
                    break;
                case 4:
                    scoreCount += 100;
                    break;
                default:
                    break;
            }
            score.text(scoreCount);
        };
        // gameOver
        var gameOver = function (win) {
            if (win) {
                result.text("你赢了!");
            } else {
                result.text("你输了!");
            }
        };
        // addTails
        var addTails = function (tails) {
            for (var i = 0; i < gameData.length - tails.length; i++) {
                gameData[i] = gameData[i + tails.length];
            }
            for (var j = 0; j < tails.length; j++) {
                gameData[gameData.length - tails.length + j] = tails[j];
            }
            cur.origin.x = cur.origin.x - tails.length;
            if (cur.origin.x < 0) {
                cur.origin.x = 0;
            }
            refreshDiv(gameData, gameDivs);
        };

        // 导出API
        this.init = init;
        this.down = down;
        this.right = right;
        this.left = left;
        this.rotate = rotate;
        this.fall = function () {
            while (down());
        };
        this.fixed = fixed;
        this.checkClear = checkClear;
        this.checkGameOver = checkGameOver;
        this.generateNext = generateNext;
        this.setTime = setTime;
        this.addScore = addScore;
        this.gameOver = gameOver;
        this.addTails = addTails;
        this.getScore = function () {
            return scoreCount;
        };
    };

    // 导出类
    return {
        Game: Game
    };
});
define([], function () {

    var Square = function () {
        // 方块
        this.data = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        // 原点
        this.origin = {
            x: 0,
            y: 0
        };
        // rotates index
        this.rIndex = 0;
    };

    var Direction = {
        UP: 'UP',
        DOWN: 'DOWN',
        LEFT: 'LEFT',
        RIGHT: 'RIGHT'
    };

    Square.prototype.canMove = function (direction, isValid) {
        var test = {};
        if (direction == Direction.DOWN) {
            test.x = this.origin.x + 1;
            test.y = this.origin.y;
        } else if (direction == Direction.LEFT) {
            test.x = this.origin.x;
            test.y = this.origin.y - 1;
        } else if (direction == Direction.RIGHT) {
            test.x = this.origin.x;
            test.y = this.origin.y + 1;
        }

        return isValid(test, this.data);
    };

    Square.prototype.move = function (direction) {
        if (direction == Direction.DOWN) {
            this.origin.x = this.origin.x + 1;
        } else if (direction == Direction.LEFT) {
            this.origin.y = this.origin.y - 1;
        } else if (direction == Direction.RIGHT) {
            this.origin.y = this.origin.y + 1;
        }
    };

    Square.prototype.canRotate = function (isValid) {
        var index = (this.rIndex + 1) % 4;
        var test = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        for (var i = 0; i < test.length; i++) {
            for (var j = 0; j < test[0].length; j++) {
                test[i][j] = this.rotates[index][i][j];
            }
        }
        return isValid(this.origin, test);
    };

    Square.prototype.rotate = function (num) {
        if (!num) num = 1;
        this.rIndex = (this.rIndex + num) % 4;
        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < this.data[0].length; j++) {
                this.data[i][j] = this.rotates[this.rIndex][i][j];
            }
        }
    };

    // 导出
    return {
        Square: Square,
        Direction: Direction
    };
});
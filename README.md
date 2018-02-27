#转载自：https://gitee.com/ryanpenn/Tetris，如有侵权请联系Benniesun26@gmail.com


# Tetris (火拼俄罗斯)
WebSocket (Netty Server) + JS (requireJS+jQuery)

![等待](https://gitee.com/ryanpenn/Tetris/raw/master/wait.png)
-
![对战](https://gitee.com/ryanpenn/Tetris/raw/master/tetris.png)

近期团队在研究微信小游戏，找了个视频课程补一补WebSocket的基础知识，顺便敲了一遍代码。实现思路和视频课程基本一致，不同的是服务端使用的是Java+Netty（课程中用的是Node.js+Socket.io)，客户端引入了jQuery和requireJS。

慕课网 @channingbreeze 讲师的（免费）视频课程：
- [基于Websocket的火拼俄罗斯（基础）](https://www.imooc.com/learn/861)
- [基于websocket的火拼俄罗斯（单机版）](https://www.imooc.com/learn/882)
- [基于websocket的火拼俄罗斯（升级版）](https://www.imooc.com/learn/885)

工程为maven项目，服务端所有代码在 src/main/java 目录中，客户端所有代码在 src/main/resources 中
 
服务端结构：
- JsonUtils 消息的json序列化
- WebSocketServer WebSocket服务器入口
- WebSocketServerHandler 业务逻辑实现

客户端结构：
- css 样式
- js  js脚本（通过requirejs实现模块化）
- tetris-client.html 客户端页面
 
 参考：
 - events.js 参考了[谈谈JS的观察者模式（自定义事件）](http://www.cnblogs.com/LuckyWinty/p/5796190.html) 
 - socket.js 对WebSocket通信的封装，接口定义参考了Socket.io.js
 
 TO be contiue：
 - 尝试通过TypeScript来实现客户端
 - 尝试通过微信小程序/小游戏来实现客户端

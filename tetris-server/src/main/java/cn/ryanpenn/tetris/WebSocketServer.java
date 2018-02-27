package cn.ryanpenn.tetris;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.group.ChannelGroup;
import io.netty.channel.group.DefaultChannelGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.stream.ChunkedWriteHandler;
import io.netty.util.concurrent.GlobalEventExecutor;

/**
 * WebSocketServer
 *
 * @author pennryan
 */
public class WebSocketServer {

    /**
     * 存储每一个接入的客户端
     */
    public static ChannelGroup clientGroup = new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);
    /**
     * PORT
     */
    public static final int SERVER_PORT = 8888;

    /**
     * WEB_SOCKET_URL
     */
    public static final String WEB_SOCKET_URL = "ws://localhost:" + SERVER_PORT + "/tetris";

    /**
     * 调试:
     * VM options: -Djavax.net.debug=handshake
     */
    public static void main(String[] args) {
        // 配置服务端NIO线程组
        EventLoopGroup boss = new NioEventLoopGroup();
        EventLoopGroup work = new NioEventLoopGroup();

        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(boss, work);
            bootstrap.channel(NioServerSocketChannel.class);
            // 配置TCP参数,backlog大小
            bootstrap.option(ChannelOption.SO_BACKLOG, 1024);
            bootstrap.childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel c) throws Exception {
                    c.pipeline().addLast("http-codec", new HttpServerCodec());
                    c.pipeline().addLast("aggregator", new HttpObjectAggregator(65536));
                    c.pipeline().addLast("http-chunked", new ChunkedWriteHandler());
                    c.pipeline().addLast(new WebSocketServerHandler());
                }
            });

            System.out.println("等待客户端连接..." + SERVER_PORT);
            Channel c = bootstrap.bind(SERVER_PORT).sync().channel();
            c.closeFuture().sync();

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            work.shutdownGracefully();
            boss.shutdownGracefully();
        }
    }
}

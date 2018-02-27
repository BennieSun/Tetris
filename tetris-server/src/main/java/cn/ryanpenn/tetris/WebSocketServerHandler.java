package cn.ryanpenn.tetris;

import com.google.common.util.concurrent.ThreadFactoryBuilder;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.util.CharsetUtil;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;
import java.util.concurrent.*;

/**
 * WebSocketServerHandler
 *
 * @author pennryan
 */
public class WebSocketServerHandler extends SimpleChannelInboundHandler<Object> {

    private static final String WEBSOCKET = "websocket";
    private static final String UPGRADE = "Upgrade";
    private static final int CLIENT_SIZE = 2;

    private ThreadFactory namedThreadFactory = new ThreadFactoryBuilder()
            .setNameFormat("reply-pool").build();

    private ExecutorService singleThreadPool = null;

    /**
     * 处理WebSocket的握手
     */
    private WebSocketServerHandshaker handshaker;

    public WebSocketServerHandler() {
        singleThreadPool = new ThreadPoolExecutor(1, 1,
                0L, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(1024),
                namedThreadFactory,
                new ThreadPoolExecutor.AbortPolicy());
    }

    @Override
    protected void finalize() throws Throwable {
        singleThreadPool.shutdown();
        super.finalize();
    }

    /**
     * 服务端处理客户端请求的核心方法
     *
     * @param ctx
     * @param msg
     * @throws Exception
     */
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {

        // 握手
        if (msg instanceof FullHttpRequest) {
            handleHttpRequest(ctx, (FullHttpRequest) msg);
        }
        // WebSocket连接
        else if (msg instanceof WebSocketFrame) {
            handleWebSocketFrame(ctx, (WebSocketFrame) msg);
        }
    }

    /**
     * 处理Websocket请求
     *
     * @param ctx
     * @param frame
     */
    private void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
        // 判断是否为关闭指令
        if (frame instanceof CloseWebSocketFrame) {
            handshaker.close(ctx.channel(), (CloseWebSocketFrame) frame.retain());
            System.out.println("收到关闭指令");
        }
        // 是否为Ping消息
        else if (frame instanceof PingWebSocketFrame) {
            ctx.channel().write(new PongWebSocketFrame(frame.content().retain()));
            System.out.println("收到PING指令");
        }
        // 判断是否为二进制消息
        else if (frame instanceof BinaryWebSocketFrame) {
            String text = ((BinaryWebSocketFrame) frame).content().toString(CharsetUtil.UTF_8);
            System.out.println("收到二进制消息:" + text);
            // 暂不支持二进制消息
        }
        // 判断是否为文本消息
        else if (frame instanceof TextWebSocketFrame) {
            String request = ((TextWebSocketFrame) frame).text();
            System.out.println("收到文本消息:" + request);

            Map msg = JsonUtils.jsonToMap(request);
            if (msg != null) {
                String uuid = (String) msg.get("uuid");
                String type = (String) msg.get("type");

                // 转发消息:
                // init, next, rotate, right, down, left, fall, fixed, lines, time, over, tails, leave
                if (!StringUtils.isEmpty(type)) {
                    WebSocketServer.clientGroup.stream().forEach(item -> {
                        // 发给对方
                        if (!item.id().toString().equalsIgnoreCase(uuid)) {
                            item.writeAndFlush(new TextWebSocketFrame(
                                    JsonUtils.mapToJsonWithType(type, msg.get("data"))
                            ));
                        }
                    });
                }
            }
        }
    }

    /**
     * 处理客户端握手请求
     *
     * @param ctx
     * @param req
     */
    private void handleHttpRequest(ChannelHandlerContext ctx, FullHttpRequest req) {

        // 判断是否为WebSocket握手请求
        if (!req.decoderResult().isSuccess() || !(WEBSOCKET.equals(req.headers().get(UPGRADE)))) {
            sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST));
            return;
        }

        // 创建WebSocket握手
        WebSocketServerHandshakerFactory wsFactory =
                new WebSocketServerHandshakerFactory(WebSocketServer.WEB_SOCKET_URL, null, false);
        handshaker = wsFactory.newHandshaker(req);
        if (handshaker == null) {
            WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
        } else {
            handshaker.handshake(ctx.channel(), req);
        }
    }

    /**
     * 服务端回复客户端的握手请求
     *
     * @param ctx
     * @param req
     * @param resp
     */
    private void sendHttpResponse(ChannelHandlerContext ctx, FullHttpRequest req, DefaultFullHttpResponse resp) {
        if (resp.status().code() != HttpResponseStatus.OK.code()) {
            ByteBuf buf = Unpooled.copiedBuffer(resp.status().toString(), CharsetUtil.UTF_8);
            resp.content().writeBytes(buf);
            buf.release();
        }
        // 回复数据
        ChannelFuture cf = ctx.channel().writeAndFlush(resp);
        if (resp.status().code() != HttpResponseStatus.OK.code()) {
            cf.addListener(ChannelFutureListener.CLOSE);
        }
    }

    /**
     * 客户端与服务端创建连接时调用
     *
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        WebSocketServer.clientGroup.add(ctx.channel());
        System.out.println("客户端已连接...");

        singleThreadPool.execute(() -> {
            // 返回客户端ID
            ctx.channel().writeAndFlush(new TextWebSocketFrame(
                    JsonUtils.mapToJsonWithType("UUID", ctx.channel().id().toString())));

            // 返回消息(等待,或开始)
            TextWebSocketFrame data;
            if (WebSocketServer.clientGroup.size() < CLIENT_SIZE) {
                data = new TextWebSocketFrame(JsonUtils.mapToJsonWithType("wait", null));
            } else {
                data = new TextWebSocketFrame(JsonUtils.mapToJsonWithType("start", null));
            }
            WebSocketServer.clientGroup.writeAndFlush(data);
        });
    }

    /**
     * 客户端与服务端断开连接时调用
     *
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        WebSocketServer.clientGroup.remove(ctx.channel());
        System.out.println("客户端已断开...");
        if (WebSocketServer.clientGroup.size() > 0) {
            WebSocketServer.clientGroup.writeAndFlush(new TextWebSocketFrame(
                    JsonUtils.mapToJsonWithType("leave", "{}")));
        }
    }

    /**
     * 服务端接收客户端发送数据结束后调用
     *
     * @param ctx
     * @throws Exception
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.flush();
    }

    /**
     * 出现异常时调动
     *
     * @param ctx
     * @param cause
     * @throws Exception
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        cause.printStackTrace();
        ctx.close();
    }
}

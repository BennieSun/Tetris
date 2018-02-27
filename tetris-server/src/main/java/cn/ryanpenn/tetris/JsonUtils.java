package cn.ryanpenn.tetris;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * JsonUtils
 *
 * @author pennryan
 */
@SuppressWarnings("unchecked")
public class JsonUtils {

    private static final String MESSAGE_TYPE = "type";

    /**
     * Json字符串转Map对象
     * @param json json字符串
     * @return Map对象
     */
    public static Map jsonToMap(String json) {

        ObjectMapper mapper = new ObjectMapper();
        try {
            Map m = mapper.readValue(json, Map.class);
            // 检查包
            if (m != null && !m.isEmpty() && m.containsKey(MESSAGE_TYPE)) {
                return m;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Map对象转Json字符串
     * @param map Map对象
     * @return Json字符串
     */
    public static String mapToJson(Map map) {
        String json = null;
        ObjectMapper mapper = new ObjectMapper();
        try {
            json = mapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return json;
    }

    /**
     * 消息对象转Json字符串
     * @param type 消息类型
     * @param data 消息数据
     * @return Json字符串
     */
    public static String mapToJsonWithType(String type, Object data) {
        Map m = new HashMap(1);
        m.put("type", type);
        m.put("data", data == null ? "{}" : data);
        return mapToJson(m);
    }

}

package com.example.drivingsystem.common;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 接口统一返回包装类
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Result {


    public static final String CODE_SUCCESS = "200";
    public static final String CODE_AUTH_ERROR = "401";
    public static final String CODE_SYS_ERROR = "500";

    private String code;  //请求的返回码
    private String msg;   //错误的详细信息
    private String data;  //数据从什么地方返回出去

    public static Result success() {
        return new Result(CODE_SUCCESS, "请求成功", null);
    }

    public static Result success(Object data) {
        return new Result(CODE_SUCCESS, "请求成功", data);
    }

    public static Result error(String msg) {
        return new Result(CODE_SYS_ERROR, msg, null);
    }




}

package com.example.drivingsystem.exception;

import com.example.drivingsystem.common.enums.ResultCodeEnum;

public class CustomException extends RuntimeException {

    private String code;
    private String msg;

    public CustomException(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }
    public CustomException(ResultCodeEnum resultCodeEnum) {
        this.code = resultCodeEnum.code;
        this.msg = resultCodeEnum.msg;
    }
    // Getter for code
    public String getCode() {
        return code;
    }

    // Getter for msg
    public String getMsg() {
        return msg;
    }
}


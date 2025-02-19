package com.example.drivingsystem.exception;


import com.example.drivingsystem.common.Result;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;



@ControllerAdvice("com.example.drivingsystem.controller")
public class GlobalExceptionHandler {

    private static final Log log = LogFactory.getLog(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    @ResponseBody // 返回json串
    public Result error(Exception e) {
        log.error("异常信息：", e);
        return Result.error();
    }

    @ExceptionHandler(CustomException.class)
    @ResponseBody // 返回json串
    public Result error(CustomException e) {
        log.error("异常信息：", e);
        return Result.error(e.getCode(), e.getMsg());
    }
}


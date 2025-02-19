package com.example.drivingsystem.controller;


import com.example.drivingsystem.common.Result;
import com.example.drivingsystem.common.enums.ResultCodeEnum;
import com.example.drivingsystem.exception.CustomException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TextController {

    @GetMapping("/hello")
    public Result hello(){
        throw new CustomException(ResultCodeEnum.USER_ACCOUNT_ERROR);
    }
}

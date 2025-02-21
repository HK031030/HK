package com.example.drivingsystem.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.xml.transform.Result;

@RestController
@RequestMapping("/file")
public class FileController {

    @PostMapping("/upload")
    public Result upload(MultipartFile file) {
        return Result.success("");  //返回文件的链接，这个链接就是文件的下载地址，这个下载地址就是我的后台提供出来的
    }

}
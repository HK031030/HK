package com.example.drivingsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication
public class DrivingSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(DrivingSystemApplication.class, args);
    }

}

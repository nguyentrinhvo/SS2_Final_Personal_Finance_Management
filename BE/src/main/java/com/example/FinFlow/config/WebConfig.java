package com.example.FinFlow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        exposeDirectory("uploads", registry);
    }

    private void exposeDirectory(String dirName, ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(dirName);
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        
        // Ensure standard file protocol for Windows
        String resourceLocation = "file:///" + uploadPath.replace("\\", "/") + "/";
        
        registry.addResourceHandler("/" + dirName + "/**")
                .addResourceLocations(resourceLocation);
    }
}

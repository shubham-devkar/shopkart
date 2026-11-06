
package com.shopkart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ProfilePhotoConfig implements WebMvcConfigurer {

    @Value("${shopkart.upload-dir:uploads/profile-photos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path directory = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        String location = directory.toUri().toString();

        registry.addResourceHandler("/profile-photos/**")
                .addResourceLocations(location);
    }
}

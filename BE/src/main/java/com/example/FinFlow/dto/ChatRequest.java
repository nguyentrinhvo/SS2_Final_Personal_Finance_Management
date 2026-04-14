package com.example.FinFlow.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {
    private String message;
    private Long userId;
}

@Data
class GeminiRequest {
    private List<Content> contents;

    @Data
    public static class Content {
        private List<Part> parts;
    }

    @Data
    public static class Part {
        private String text;
    }
}

package com.example.FinFlow.controller;

import com.example.FinFlow.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping(value = "/ask", consumes = {"multipart/form-data"})
    public ResponseEntity<String> ask(
            @RequestParam("message") String message,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        String response = chatbotService.handleChat(message, userId, image);
        return ResponseEntity.ok(response);
    }
}

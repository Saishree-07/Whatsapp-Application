package com.example.whatsapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@SpringBootApplication
public class WhatsappApp {

    private final List<Message> messages = Collections.synchronizedList(new ArrayList<>());

    public static void main(String[] args) {
        SpringApplication.run(WhatsappApp.class, args);
    }

    @GetMapping("/messages")
    public List<Message> getMessages() {
        return messages;
    }

    @PostMapping("/messages")
    public Message postMessage(@RequestBody Message msg) {
        msg.setId(System.currentTimeMillis());
        messages.add(msg);
        return msg;
    }

    public static class Message {
        private long id;
        private String from;
        private String text;

        public Message() {}

        public long getId() { return id; }
        public void setId(long id) { this.id = id; }

        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }
}

package com.diplomado.documentsSignature.controller;

import com.diplomado.documentsSignature.model.PublicKey;
import com.diplomado.documentsSignature.service.IPublicKeyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class KeyCotroller {

    @Autowired
    IPublicKeyService service;

    @GetMapping("/{id}")
    public ResponseEntity<?> findKey(@PathVariable Long id){
        PublicKey keyFromDB = service.findPublicKey(id);
        return ResponseEntity.ok(keyFromDB);
    }

    @GetMapping("/")
    public ResponseEntity<?> findAllKeys(){
        List<PublicKey> keysFromDB = service.findAll();
        return ResponseEntity.ok(keysFromDB);
    }

    @PostMapping("/")
    public ResponseEntity<?> saveKey(@RequestBody PublicKey key){
        return ResponseEntity.ok(service.savePublicKey(key));
    }
}

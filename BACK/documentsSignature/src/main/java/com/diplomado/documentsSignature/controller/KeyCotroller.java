package com.diplomado.documentsSignature.controller;

import com.diplomado.documentsSignature.model.PublicKey;
import com.diplomado.documentsSignature.service.IPublicKeyService;
import com.diplomado.documentsSignature.signature.Signer;
import com.diplomado.documentsSignature.utils.PublicKeyRetrievalUtil;
import com.diplomado.documentsSignature.utils.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.security.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/sign")
    public ResponseEntity<?> firmarArchivo(@RequestParam("file") MultipartFile file) throws NoSuchAlgorithmException, IOException, SignatureException, InvalidKeyException {
        //PublicKey keyFromDB = service.findPublicKey(id);
        //String fileName = file.getName();

        String algorithm = "RSA";
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(algorithm);
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        java.security.PublicKey publicKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();

        byte[] file2 = file.getBytes();

        byte[] digitalSignature = Signer.signFile(file2,"SHA256withRSA",privateKey);

//        System.out.println(Util.byteArrayToHexString(digitalSignature,""));
        String res = Util.byteArrayToHexString(digitalSignature,"");
        return ResponseEntity.ok("Firma del archivo: "+res);
    }

    @PostMapping("/firmar")
    public ResponseEntity<?> firmar2(@RequestParam("file") MultipartFile file, @RequestParam("privatekey") String privateKey, @RequestParam("publickey") String publickey) throws Exception {

        java.security.PublicKey publicKeyRetrieval = PublicKeyRetrievalUtil.getPublicKeyFromDatabase(publickey);
        PrivateKey privateKeyRetrieval = PublicKeyRetrievalUtil.getPrivateKey(privateKey);

        byte[] file2 = file.getBytes();

        byte[] digitalSignature = Signer.signFile(file2,"SHA256withRSA",privateKeyRetrieval);

        boolean isVerified = Signer.verifyFileSignature(file2,"SHA256withRSA",publicKeyRetrieval,digitalSignature);

        Map<String,String> resultados = new HashMap<>();
        resultados.put("Firma digital del archivo",Util.byteArrayToHexString(digitalSignature,""));
        resultados.put("Verificacion de la firma",isVerified ? "Firmado Verificada OK" : "Fallo verificacion");

        return ResponseEntity.ok(resultados);
    }

    //VEr si es viable crear un controlador que reciba el arreglo de bytes del archivo en vez del archivo completo
}

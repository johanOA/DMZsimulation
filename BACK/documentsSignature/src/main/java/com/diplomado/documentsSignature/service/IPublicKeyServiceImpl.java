package com.diplomado.documentsSignature.service;

import com.diplomado.documentsSignature.model.PublicKey;
import com.diplomado.documentsSignature.repository.PublicKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IPublicKeyServiceImpl implements IPublicKeyService{

    @Autowired
    PublicKeyRepository repository;

    @Override
    public PublicKey findPublicKey(Long id) {
        return repository.findById(id).orElseThrow(() -> {
            throw new IllegalArgumentException("La llave con el id:" + id + " no existe");
        });
    }

    @Override
    public List<PublicKey> findAll() {
        return repository.findAll();
    }

    @Override
    public PublicKey savePublicKey(PublicKey key) {
        return repository.save(key);
    }
}

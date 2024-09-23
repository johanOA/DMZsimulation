package com.diplomado.documentsSignature.service;

import com.diplomado.documentsSignature.model.PublicKey;
import com.diplomado.documentsSignature.repository.PublicKeyRepository;
import com.diplomado.documentsSignature.utils.PublicKeyRetrievalUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IPublicKeyServiceImpl implements IPublicKeyService{

    @Autowired
    PublicKeyRepository repository;

    @Override
    public PublicKey findPublicKey(Long id)  {
        PublicKey key = repository.findById(id).orElseThrow(() -> {
            throw new IllegalArgumentException("La llave con el id:" + id + " no existe");});
        String llave = key.getKey_value();
        try {
            java.security.PublicKey key2 = PublicKeyRetrievalUtil.getPublicKeyFromDatabase(llave);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return key;
    }

    @Override
    public List<PublicKey> findAll() {
        return repository.findAll();
    }

    @Override
    public PublicKey savePublicKey(PublicKey key) {
        return repository.save(key);
    }

    @Override
    public PublicKey fingGeneratedKey(String alias) {
        PublicKey key = repository.findByAlias(alias);
        //java.security.PublicKey keyFromDB = PublicKeyRetrievalUtil.getPublicKeyFromDatabase(repository.findByAlias().);

        return key;
    }
}

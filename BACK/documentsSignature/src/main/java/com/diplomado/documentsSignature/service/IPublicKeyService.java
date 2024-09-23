package com.diplomado.documentsSignature.service;

import com.diplomado.documentsSignature.model.PublicKey;

import java.util.List;

public interface IPublicKeyService {

    PublicKey findPublicKey(Long id);

    List<PublicKey> findAll();

    PublicKey savePublicKey(PublicKey key);

    PublicKey fingGeneratedKey(String alias);
}

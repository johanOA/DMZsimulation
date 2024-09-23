package com.diplomado.documentsSignature.repository;

import com.diplomado.documentsSignature.model.PublicKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicKeyRepository extends JpaRepository<PublicKey,Long> {

    PublicKey findByAlias(String alias);
}

package com.diplomado.documentsSignature.utils;


import javax.crypto.*;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class SymmetricCipher {

    private SecretKey secretKey;

    private Cipher cipher;

    public SymmetricCipher (SecretKey secretKey, String transformation) throws NoSuchPaddingException, NoSuchAlgorithmException {
        this.secretKey = secretKey;
        cipher = Cipher.getInstance(transformation);
    }

    public byte[] encryptMessage(String input) throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        byte[] clearText = input.getBytes();
        byte[] cipherText = null;

        cipher.init(Cipher.ENCRYPT_MODE,secretKey);
        cipherText = cipher.doFinal(clearText);

        return cipherText;
    }

    public String decryptMessage(byte[] input) throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        String output = "";

        cipher.init(Cipher.DECRYPT_MODE,secretKey);
        byte[] clearText = cipher.doFinal(input);
        output = new String(clearText);

        return output;
    }

    public byte[] encryptObject(Object input) throws IOException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        byte[] cipherObject = null;
        byte[] clearObject = null;

        clearObject = Util.objectRoByteArray(input);

        cipher.init(Cipher.ENCRYPT_MODE,secretKey);
        cipherObject = cipher.doFinal(clearObject);

        return cipherObject;
    }

    public Object decryptObject(byte[] input) throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException, IOException, ClassNotFoundException {
        Object output = null;

        cipher.init(Cipher.DECRYPT_MODE,secretKey);
        byte[] clearObject = cipher.doFinal(input);

        output = Util.byteArrayToObject(clearObject);
        return output;
    }
}

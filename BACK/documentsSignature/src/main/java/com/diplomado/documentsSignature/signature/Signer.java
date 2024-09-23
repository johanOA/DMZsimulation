package com.diplomado.documentsSignature.signature;

import java.io.*;
import java.nio.file.Files;
import java.security.*;
import java.util.Base64;

public class Signer {

    public static byte[] signMessage(String message, String algorithm, PrivateKey privateKey) throws NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        Signature signature = Signature.getInstance(algorithm);
        signature.initSign(privateKey);
        signature.update(message.getBytes());

        return signature.sign();
    }

    public static boolean verifyMessageSignature(String message, String algorithm, PublicKey publicKey,
                                                 byte[] digitalSignature) throws NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        Signature signature = Signature.getInstance(algorithm);
        signature.initVerify(publicKey);
        signature.update(message.getBytes());

        return signature.verify(digitalSignature);
    }

    public static byte[] signFile (byte[] fileBytes, String algorithm, PrivateKey privateKey) throws IOException, NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        /*File file = new File(fileName);
        byte[] fileBytes = Files.readAllBytes(file.toPath());*/

        Signature signature = Signature.getInstance(algorithm);
        signature.initSign(privateKey);
        signature.update(fileBytes);

        return signature.sign();
    }

    public static boolean verifyFileSignature(byte[] fileBytes, String algorithm, PublicKey publicKey,
                                              byte[] digitalSignature) throws IOException, NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        /*File file = new File(fileName);
        byte[] fileBytes = Files.readAllBytes(file.toPath());*/

        Signature signature = Signature.getInstance(algorithm);
        signature.initVerify(publicKey);
        signature.update(fileBytes);

        return signature.verify(digitalSignature);
    }

    /*public static void generateSignaturesFile(String folderPath, String outputFilePath, String algorithm, PrivateKey privateKey) throws IOException, NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        File folder = new File(folderPath);
        File[] listOfFiles = folder.listFiles();
        if (listOfFiles == null) {
            throw new IOException("The folder is empty or does not exist.");
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath))) {
            for (File file : listOfFiles) {
                if (file.isFile()) {
                    byte[] signature = signFile(file.getAbsolutePath(), algorithm, privateKey);
                    String encodedSignature = Base64.getEncoder().encodeToString(signature);
                    writer.write(file.getName() + "||" + encodedSignature);
                    writer.newLine();
                }
            }
        }
    }*/

    public static boolean verifySignaturesFile(String folderPath, String signatureFilePath, String algorithm, PublicKey publicKey) throws IOException, NoSuchAlgorithmException, InvalidKeyException, SignatureException {
        try (BufferedReader reader = new BufferedReader(new FileReader(signatureFilePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split("\\|\\|");
                if (parts.length != 2) {
                    throw new IOException("Invalid format in signature file.");
                }
                String fileName = parts[0];
                String encodedSignature = parts[1];
                byte[] digitalSignature = Base64.getDecoder().decode(encodedSignature);

                File file = new File(folderPath, fileName);
                if (!file.exists()) {
                    System.out.println("File " + fileName + " does not exist.");
                    return false;
                }

                byte[] fileBytes = Files.readAllBytes(file.toPath());

                Signature signature = Signature.getInstance(algorithm);
                signature.initVerify(publicKey);
                signature.update(fileBytes);

                if (!signature.verify(digitalSignature)) {
                    System.out.println("Signature verification failed for file " + fileName);
                    return false;
                }
            }
        }
        return true;
    }
}

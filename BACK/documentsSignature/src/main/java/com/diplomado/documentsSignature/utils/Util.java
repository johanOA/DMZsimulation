package com.diplomado.documentsSignature.utils;

import javax.crypto.*;
import java.io.*;
import java.net.Socket;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Arrays;
import java.util.Scanner;

public class Util {
    public static String byteArrayToHexString(byte[] bytes, String separador) {
        String result = "";

        for (int i = 0; i < bytes.length; i++) {
            result += String.format("%02x", bytes[i]) + separador;
        }
        return result.toString();
    }

    public static void saveObject(Object o, String fileName) throws IOException {
        FileOutputStream fileOut;
        ObjectOutputStream out;

        fileOut = new FileOutputStream(fileName);
        out = new ObjectOutputStream(fileOut);

        out.writeObject(o);

        out.flush();
        out.close();
    }

    public static Object loadObject(String fileName) throws IOException, InterruptedException, ClassNotFoundException {
        FileInputStream fileIn;
        ObjectInputStream in;

        fileIn = new FileInputStream(fileName);
        in = new ObjectInputStream(fileIn);

        Thread.sleep(100);

        Object o = in.readObject();

        fileIn.close();
        in.close();

        return o;
    }

    public static byte[] objectRoByteArray(Object o) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream out = new ObjectOutputStream(bos);
        out.writeObject(o);
        out.close();
        byte[] buffer = bos.toByteArray();

        return buffer;
    }

    public static Object byteArrayToObject(byte[] byteArray) throws IOException, ClassNotFoundException {
        ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(byteArray));
        Object o = in.readObject();
        in.close();

        return o;
    }

    public static void encryptTextFile(String fileName) {

        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            BufferedWriter writer = new BufferedWriter(new FileWriter(fileName + ".encrypted"));
            StringBuilder lineasAEncodear = new StringBuilder();
            SecretKey secretKey = KeyGenerator.getInstance("DES").generateKey();
            SymmetricCipher cipher = new SymmetricCipher(secretKey, "DES/ECB/PKCS5Padding");
            while ((line = br.readLine()) != null) {
                byte[] encryptedText = cipher.encryptMessage(line);
                String lineaCodeada = byteArrayToHexString(encryptedText, "");
                System.out.println(lineaCodeada);
                lineasAEncodear.append(lineaCodeada).append("\n");
            }
            if (lineasAEncodear.length() > 0) {
                lineasAEncodear.setLength(lineasAEncodear.length() - 1);
            }
            Util.saveObject(secretKey, "llaveSecreta.key");
            System.out.println("Lineas a encodear: " + lineasAEncodear);
            byte[] todoCodeadoBA = Util.objectRoByteArray(lineasAEncodear.toString());
            String todoB64 = Base64.encode(todoCodeadoBA);
            System.out.println("Final codeado: " + todoB64);
            writer.write(todoB64);
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (NoSuchPaddingException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } catch (IllegalBlockSizeException e) {
            throw new RuntimeException(e);
        } catch (BadPaddingException e) {
            throw new RuntimeException(e);
        } catch (InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    public static void encryptTextFile2(String fileName) {

        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            BufferedWriter writer = new BufferedWriter(new FileWriter(fileName + ".encrypted"));
            StringBuilder lineasAEncodear = new StringBuilder();
            SecretKey secretKey = KeyGenerator.getInstance("DES").generateKey();
            SymmetricCipher cipher = new SymmetricCipher(secretKey, "DES/ECB/PKCS5Padding");
            while ((line = br.readLine()) != null) {
                byte[] encryptedText = cipher.encryptMessage(line);
                String lineaCodeada = Base64.encode(encryptedText);
                System.out.println(lineaCodeada);
                lineasAEncodear.append(lineaCodeada).append("\n");
            }
            if (lineasAEncodear.length() > 0) {
                lineasAEncodear.setLength(lineasAEncodear.length() - 1);
            }
            Util.saveObject(secretKey, "llaveSecreta.key");
            System.out.println("Lineas a encodear: " + lineasAEncodear);
            writer.write(lineasAEncodear.toString());
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (NoSuchPaddingException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } catch (IllegalBlockSizeException e) {
            throw new RuntimeException(e);
        } catch (BadPaddingException e) {
            throw new RuntimeException(e);
        } catch (InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    public static void decryptFile(String fileName) throws IOException, InterruptedException, ClassNotFoundException {
        SecretKey secretKey = (SecretKey) Util.loadObject("llaveSecreta.key");
        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            String lineaB64 = "";
            SymmetricCipher cipher = new SymmetricCipher(secretKey, "DES/ECB/PKCS5Padding");
            int indice = fileName.indexOf(".");
            String nuevoNombre = fileName.substring(0, indice) + ".plain.txt";
            System.out.println("Nuevo nombre: " + nuevoNombre);
            BufferedWriter writer = new BufferedWriter(new FileWriter(nuevoNombre));
            while ((line = br.readLine()) != null) {
                lineaB64 = line;
            }
            byte[] archivoDecode = Base64.decode(lineaB64);
            String decodedLine = (String) Util.byteArrayToObject(archivoDecode);
            System.out.println("String decodificado: " + decodedLine);
            StringBuilder resultado = new StringBuilder();
            try (Scanner scanner = new Scanner(new StringReader(decodedLine))) {
                while (scanner.hasNextLine()) {
                    String linea = scanner.nextLine();
                    System.out.println("Linea: " + linea);
                    byte[] lineaBA = Util.objectRoByteArray(linea);
                    try {
                        String lineaDecrypted = cipher.decryptMessage(lineaBA);
                        resultado.append(lineaDecrypted).append("\n");
                    } catch (InvalidKeyException | IllegalBlockSizeException | BadPaddingException e) {
                        System.err.println("Error al descifrar la línea: " + e.getMessage());
                        e.printStackTrace();
                    }

                    // Aquí puedes procesar cada línea
                }
                if (resultado.length() > 0) {
                    resultado.setLength(resultado.length() - 1);
                }
                writer.write(resultado.toString());
                writer.close();

            } catch (Exception e) {
                e.printStackTrace();
            }
        } catch (NoSuchPaddingException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public static void decryptFile2(String fileName) throws IOException, InterruptedException, ClassNotFoundException {
        SecretKey secretKey = (SecretKey) Util.loadObject("llaveSecreta.key");
        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            String lineaB64 = "";
            StringBuilder resultado = new StringBuilder();
            SymmetricCipher cipher = new SymmetricCipher(secretKey, "DES/ECB/PKCS5Padding");
            int indice = fileName.indexOf(".");
            String nuevoNombre = fileName.substring(0, indice) + ".plain.txt";
            System.out.println("Nuevo nombre: " + nuevoNombre);
            BufferedWriter writer = new BufferedWriter(new FileWriter(nuevoNombre));
            while ((line = br.readLine()) != null) {
                byte[] lineBA = Base64.decode(line);
                String decodedLine = cipher.decryptMessage(lineBA);
                resultado.append(decodedLine).append("\n");
            }
            if (resultado.length() > 0) {
                resultado.setLength(resultado.length() - 1);
            }
            writer.write(resultado.toString());
            writer.close();
        } catch (NoSuchPaddingException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } catch (IllegalBlockSizeException e) {
            throw new RuntimeException(e);
        } catch (BadPaddingException e) {
            throw new RuntimeException(e);
        } catch (InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    public static void processFile(String inputFilePath, String outputFilePath, int blockSize) throws IOException {
        try (FileInputStream fis = new FileInputStream(inputFilePath);
             BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(outputFilePath))) {

            SecretKey secretKey = (SecretKey) Util.loadObject("llaveSecreta.key");
            SymmetricCipher cipher = new SymmetricCipher(secretKey, "DES/ECB/PKCS5Padding");
            byte[] buffer = new byte[blockSize];
            int bytesRead;

            while ((bytesRead = fis.read(buffer)) != -1) {
                byte[] block;

                if (bytesRead < blockSize) {
                    // Si leímos menos bytes que el tamaño del bloque, ajustar el tamaño del bloque
                    block = new byte[bytesRead];
                    System.arraycopy(buffer, 0, block, 0, bytesRead);
                } else {
                    block = buffer;
                }

                // Encriptar el bloque
                byte[] encryptedBlock = cipher.encryptMessage(Arrays.toString(block));
                System.out.println("Bloque encriptado: " + Arrays.toString(encryptedBlock));

                // Codificar el bloque en Base64
                String base64EncodedBlock = Base64.encode(encryptedBlock);
                System.out.println("Bloque encodeado: " + base64EncodedBlock);

                // Escribir la cadena codificada en el archivo de salida
                bos.write(base64EncodedBlock.getBytes());
                bos.write(System.lineSeparator().getBytes());
            }
        } catch (NoSuchPaddingException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } catch (IllegalBlockSizeException e) {
            throw new RuntimeException(e);
        } catch (BadPaddingException e) {
            throw new RuntimeException(e);
        } catch (InvalidKeyException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    public static void decryptBinaryFile(String inputFilePath, String outputFilePath) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(inputFilePath));
             BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(outputFilePath))) {

            SecretKey secretKey = (SecretKey) Util.loadObject("llaveSecreta.key");
            SymmetricCipher cipher = new SymmetricCipher(secretKey, "DES/ECB/PKCS5Padding");
            String base64EncodedBlock;
            while ((base64EncodedBlock = br.readLine()) != null) {
                // Decodificar el bloque en Base64
                byte[] encryptedBlock = Base64.decode(base64EncodedBlock);

                // Desencriptar el bloque
                byte[] decryptedBlock = cipher.decryptMessage(encryptedBlock).getBytes();
                System.out.println("Bloque desencriptado: " + Arrays.toString(decryptedBlock));
                // Escribir el bloque desencriptado en el archivo de salida
                bos.write(decryptedBlock);
            }
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        } catch (NoSuchPaddingException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        } catch (IllegalBlockSizeException e) {
            throw new RuntimeException(e);
        } catch (BadPaddingException e) {
            throw new RuntimeException(e);
        } catch (InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    public static String imprimirLlavePublica(PublicKey key) {
        byte[] keyBA = key.getEncoded();
        String keyB64 = Base64.encode(keyBA);
        StringBuilder cadena = new StringBuilder();
        cadena.append("-----BEGIN PUBLIC KEY-----").append("\n");
        cadena.append(keyB64).append("\n");
        cadena.append("-----END PUBLIC KEY-----");
        return cadena.toString();
    }

    public static String imprimirLlavePrivada(PrivateKey key) {
        byte[] keyBA = key.getEncoded();
        String keyB64 = Base64.encode(keyBA);
        StringBuilder cadena = new StringBuilder();
        cadena.append("-----BEGIN PRIVATE KEY-----").append("\n");
        cadena.append(keyB64).append("\n");
        cadena.append("-----END PRIVATE KEY-----");
        return cadena.toString();
    }


}
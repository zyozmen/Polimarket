import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * Servicio de cifrado de contraseñas compatible con backend Spring Boot
 * 
 * Especificaciones:
 * - Algoritmo: AES-128 ECB
 * - Clave: PoliMarket2025SecurePasswordKey!
 * - Derivación: SHA-256 de la clave, truncada a 16 bytes (128 bits)
 * - Salida: Base64
 * 
 * Casos de prueba:
 * - encrypt('admin123') → 'w2Qd5CtcPGVRmnnpjV1ORg=='
 * - encrypt('password123') → 'Z2ai9mu645ETPfT4zyJQoA=='
 * - encrypt('ventas123') → '38kAwDgUWcEcY3YrhGyShA=='
 * - encrypt('test123') → '6BdlLHJb4JgymaEFst0Tqw=='
 */
@Injectable({
  providedIn: 'root'
})
export class PasswordEncryptionService {
  // Clave secreta (debe coincidir EXACTAMENTE con el backend Spring Boot)
  private readonly SECRET_KEY = 'PoliMarket2025SecurePasswordKey!';
  
  // Clave derivada (se calcula una vez al inicializar)
  private readonly derivedKey: CryptoJS.lib.WordArray;

  constructor() {
    // Generar clave derivada al inicializar el servicio
    this.derivedKey = this.deriveKey();
  }

  /**
   * Deriva la clave usando SHA-256 y toma los primeros 16 bytes (128 bits)
   * Esto replica exactamente el comportamiento del backend Java:
   * 
   * ```java
   * MessageDigest sha = MessageDigest.getInstance("SHA-256");
   * byte[] key = sha.digest(secretKey.getBytes(StandardCharsets.UTF_8));
   * key = Arrays.copyOf(key, 16); // AES-128
   * ```
   */
  private deriveKey(): CryptoJS.lib.WordArray {
    // 1. Generar hash SHA-256 de la clave secreta
    const hash = CryptoJS.SHA256(this.SECRET_KEY);
    
    // 2. Tomar solo los primeros 16 bytes (128 bits) para AES-128
    // Un WordArray de CryptoJS tiene words (array de enteros de 32 bits)
    // 16 bytes = 128 bits = 4 words de 32 bits
    const key128bits = CryptoJS.lib.WordArray.create(hash.words.slice(0, 4));
    
    return key128bits;
  }

  /**
   * Cifra una contraseña usando AES-128 ECB
   * Compatible con el backend Spring Boot
   * 
   * @param password - Contraseña en texto plano
   * @returns Contraseña cifrada en Base64
   * 
   * @example
   * ```typescript
   * const encrypted = service.encrypt('admin123');
   * console.log(encrypted); // 'w2Qd5CtcPGVRmnnpjV1ORg=='
   * ```
   */
  encrypt(password: string): string {
    try {
      // Convertir password a WordArray UTF-8
      const passwordUtf8 = CryptoJS.enc.Utf8.parse(password);
      
      // Cifrar usando AES en modo ECB (sin IV, igual que el backend Java)
      const encrypted = CryptoJS.AES.encrypt(passwordUtf8, this.derivedKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Retornar solo el ciphertext en Base64 (sin el formato CryptoJS)
      const base64Result = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      
      return base64Result;
    } catch (error) {
      throw new Error('No se pudo cifrar la contraseña');
    }
  }

  /**
   * Descifra una contraseña cifrada con AES-128 ECB
   * 
   * @param encryptedPassword - Contraseña cifrada en Base64
   * @returns Contraseña original en texto plano
   */
  decrypt(encryptedPassword: string): string {
    try {
      // Crear CipherParams desde Base64
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(encryptedPassword)
      });
      
      // Descifrar usando AES en modo ECB
      const decrypted = CryptoJS.AES.decrypt(cipherParams, this.derivedKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Convertir a string UTF-8
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('No se pudo descifrar la contraseña');
    }
  }

  /**
   * Verifica que el cifrado funcione correctamente con casos de prueba del backend
   * @returns true si todos los tests pasan
   */
  runTests(): boolean {
    const testCases = [
      { input: 'admin123', expected: 'w2Qd5CtcPGVRmnnpjV1ORg==' },
      { input: 'password123', expected: 'Z2ai9mu645ETPfT4zyJQoA==' },
      { input: 'ventas123', expected: '38kAwDgUWcEcY3YrhGyShA==' },
      { input: 'test123', expected: '6BdlLHJb4JgymaEFst0Tqw==' }
    ];

    console.log('🧪 Ejecutando tests de cifrado...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let allPassed = true;
    testCases.forEach((test, index) => {
      const result = this.encrypt(test.input);
      const passed = result === test.expected;
      
      console.log(`Test ${index + 1}: encrypt('${test.input}')`);
      console.log(`  Esperado: ${test.expected}`);
      console.log(`  Obtenido: ${result}`);
      console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log('');
      
      if (!passed) allPassed = false;
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(allPassed ? '✅ Todos los tests pasaron' : '❌ Algunos tests fallaron');
    
    return allPassed;
  }
}

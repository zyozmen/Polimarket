import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

/**
 * Servicio de cifrado AES-256
 * Proporciona métodos para cifrar y descifrar datos usando AES-256
 * Usado principalmente para cifrar contraseñas antes de enviarlas al backend
 */
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  // Clave secreta para cifrado AES-256 (32 caracteres para AES-256)
  // IMPORTANTE: En producción, esta clave debe estar en variables de entorno
  // y debe ser la misma que usa el backend para descifrar
  private readonly SECRET_KEY = 'PolimarketSecretKey2025!!@#$%^'; // 32 caracteres

  constructor() {}

  /**
   * Cifra un texto usando AES-256
   * @param plainText - Texto plano a cifrar
   * @returns Texto cifrado en formato Base64
   */
  encrypt(plainText: string): string {
    try {
      // Cifrar usando AES con la clave secreta
      const encrypted = CryptoJS.AES.encrypt(plainText, this.SECRET_KEY).toString();
      return encrypted;
    } catch (error) {
      console.error('Error al cifrar:', error);
      throw new Error('Error al cifrar los datos');
    }
  }

  /**
   * Descifra un texto cifrado con AES-256
   * @param cipherText - Texto cifrado en formato Base64
   * @returns Texto plano descifrado
   */
  decrypt(cipherText: string): string {
    try {
      // Descifrar usando AES con la clave secreta
      const decrypted = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error al descifrar:', error);
      throw new Error('Error al descifrar los datos');
    }
  }

  /**
   * Cifra una contraseña para enviarla al backend
   * @param password - Contraseña en texto plano
   * @returns Contraseña cifrada
   */
  encryptPassword(password: string): string {
    return this.encrypt(password);
  }

  /**
   * Genera un hash SHA-256 de un texto
   * Útil para verificaciones de integridad
   * @param text - Texto a hashear
   * @returns Hash en formato hexadecimal
   */
  hash(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }
}

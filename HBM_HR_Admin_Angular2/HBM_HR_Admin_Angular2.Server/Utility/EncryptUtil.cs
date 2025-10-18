using System.Security.Cryptography;
using System.Text;

namespace HBM_HR_Admin_Angular2.Server.Utility {
    
    public static class EncryptUtil {

        private static readonly string Key = "G7fP1qXzT9bL2sE8vW4yH6mN0rA3dC5k"; // 32 ký tự = 256 bit

        public static string Encrypt(string plainText) {
            using (Aes aes = Aes.Create()) {
                aes.Key = Encoding.UTF8.GetBytes(Key);
                aes.GenerateIV();
                var iv = aes.IV;

                using (var encryptor = aes.CreateEncryptor(aes.Key, iv)) {
                    byte[] encrypted = encryptor.TransformFinalBlock(
                        Encoding.UTF8.GetBytes(plainText), 0, plainText.Length);
                    return Convert.ToBase64String(iv.Concat(encrypted).ToArray());
                }
            }
        }

        public static string Decrypt(string cipherText) {
            var fullCipher = Convert.FromBase64String(cipherText);
            using (Aes aes = Aes.Create()) {
                aes.Key = Encoding.UTF8.GetBytes(Key);
                var iv = fullCipher.Take(16).ToArray();
                var cipher = fullCipher.Skip(16).ToArray();
                aes.IV = iv;
                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV)) {
                    var decryptedBytes = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
                    return Encoding.UTF8.GetString(decryptedBytes);
                }
            }
        }

        public static async Task EncryptFileAsync(string inputFilePath, string outputFilePath) {
            byte[] key = Encoding.UTF8.GetBytes(Key);
            byte[] iv = new byte[16]; // IV mặc định (nếu muốn có thể sinh ngẫu nhiên)

            using (Aes aes = Aes.Create()) {
                aes.Key = key;
                aes.IV = iv;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                using FileStream inputFile = new FileStream(inputFilePath, FileMode.Open, FileAccess.Read);
                using FileStream outputFile = new FileStream(outputFilePath, FileMode.Create, FileAccess.Write);
                using CryptoStream cryptoStream = new CryptoStream(outputFile, aes.CreateEncryptor(), CryptoStreamMode.Write);

                await inputFile.CopyToAsync(cryptoStream);
            }
        }

        public static async Task DecryptFileAsync(string inputFilePath, string outputFilePath) {
            byte[] key = Encoding.UTF8.GetBytes(Key);
            byte[] iv = new byte[16];

            using (Aes aes = Aes.Create()) {
                aes.Key = key;
                aes.IV = iv;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                using FileStream inputFile = new FileStream(inputFilePath, FileMode.Open, FileAccess.Read);
                using FileStream outputFile = new FileStream(outputFilePath, FileMode.Create, FileAccess.Write);
                using CryptoStream cryptoStream = new CryptoStream(inputFile, aes.CreateDecryptor(), CryptoStreamMode.Read);

                await cryptoStream.CopyToAsync(outputFile);
            }
        }

    }

}

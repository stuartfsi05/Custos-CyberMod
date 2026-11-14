/**
 * Comprime e redimensiona uma imagem enviada pelo usuário antes de salvar em Base64 no localStorage.
 * Reduz fotos de vários MB para poucos KB (~15–40 KB), evitando QuotaExceededError.
 */
export function compressImageFile(
    file: File,
    maxDimension = 400,
    quality = 0.72
): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
            reject(new Error('Não foi possível ler o arquivo de imagem.'));
        };

        reader.onload = () => {
            const rawDataUrl = reader.result;
            if (typeof rawDataUrl !== 'string') {
                reject(new Error('Formato de imagem inválido.'));
                return;
            }

            const img = new Image();
            img.onerror = () => {
                reject(new Error('Não foi possível decodificar a imagem selecionada.'));
            };

            img.onload = () => {
                const { width, height } = img;
                if (!width || !height) {
                    resolve(rawDataUrl);
                    return;
                }

                const scale = Math.min(1, maxDimension / Math.max(width, height));
                const targetWidth = Math.max(1, Math.round(width * scale));
                const targetHeight = Math.max(1, Math.round(height * scale));

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(rawDataUrl);
                    return;
                }

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                const webpDataUrl = canvas.toDataURL('image/webp', quality);
                if (webpDataUrl.startsWith('data:image/webp')) {
                    resolve(webpDataUrl);
                    return;
                }

                const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(jpegDataUrl);
            };

            img.src = rawDataUrl;
        };

        reader.readAsDataURL(file);
    });
}

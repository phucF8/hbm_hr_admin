// src/app/utils/url.util.ts

export function getFullImageUrl(partialUrl: string): string {
    const host = 'https://workhub.hbm.vn';
    const defaultAvatar = 'images/avatar_default.png';  // Đường dẫn ảnh mặc định (nếu cần)
    if (!partialUrl) {
        return defaultAvatar;
    }
    if (partialUrl.startsWith('http')) {
        return partialUrl;
    }
    return `${host}${partialUrl.startsWith('/') ? '' : '/'}${partialUrl}`;
}

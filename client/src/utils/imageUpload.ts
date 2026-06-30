import { supabase } from '../supabaseClient';

export const STORAGE_BUCKET = 'construction';

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/**
 * 업로드 전 이미지 최적화: 최대 변(maxSize)으로 리사이즈 + WebP 재인코딩(quality).
 * WebP 인코딩이 불가한 환경에서는 JPEG로 폴백한다.
 */
export async function compressImage(
  file: File,
  opts: { maxSize?: number; quality?: number } = {}
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  const maxSize = opts.maxSize ?? 1280;
  const quality = opts.quality ?? 0.8;

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { blob: file, ext: 'jpg', contentType: file.type || 'image/jpeg' };
  ctx.drawImage(img, 0, 0, width, height);

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let blob = await toBlob('image/webp');
  let ext = 'webp';
  let contentType = 'image/webp';
  if (!blob || blob.type !== 'image/webp') {
    // WebP 미지원 → JPEG 폴백
    blob = await toBlob('image/jpeg');
    ext = 'jpg';
    contentType = 'image/jpeg';
  }
  // 압축 결과가 원본보다 크면 원본 사용
  if (!blob || blob.size >= file.size) {
    return { blob: file, ext: (file.name.split('.').pop() || 'jpg').toLowerCase(), contentType: file.type || 'image/jpeg' };
  }
  return { blob, ext, contentType };
}

export interface UploadResult { url: string | null; error: string | null; }

// 보안: 허용 이미지 형식 화이트리스트 + 용량 제한
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

/** 이미지 1장: 최적화 후 Supabase Storage 업로드 → 공개 URL 반환 */
export async function uploadImage(file: File, folder: string): Promise<UploadResult> {
  try {
    if (!ALLOWED_TYPES.includes(file.type)) return { url: null, error: '허용되지 않는 형식입니다. (JPG/PNG/WEBP/GIF/AVIF만 업로드 가능)' };
    if (file.size > MAX_BYTES) return { url: null, error: '10MB 이하 이미지만 업로드할 수 있습니다.' };

    const { blob, ext, contentType } = await compressImage(file);
    const rand = Math.random().toString(36).slice(2, 9);
    const path = `${folder}/${Date.now()}-${rand}.${ext}`;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType, upsert: false });
    if (error) {
      const msg = /not found|bucket/i.test(error.message)
        ? "스토리지 버킷('construction')이 없습니다. 버킷 생성 SQL을 먼저 적용해주세요."
        : error.message;
      return { url: null, error: msg };
    }
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : '이미지 업로드에 실패했습니다.' };
  }
}

/** 여러 장 순차 업로드 (성공 URL 배열 + 첫 에러) */
export async function uploadImages(files: File[], folder: string): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];
  let firstError: string | null = null;
  for (const f of files) {
    const { url, error } = await uploadImage(f, folder);
    if (url) urls.push(url);
    else if (!firstError) firstError = error;
  }
  return { urls, error: firstError };
}

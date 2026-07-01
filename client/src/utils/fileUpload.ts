// 범용 파일 업로드(이미지 + PDF). 이미지 최적화 없이 원본 업로드.
import { supabase } from '../supabaseClient';
import { STORAGE_BUCKET } from './imageUpload';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

export interface FileUploadResult { url: string | null; error: string | null; }

export async function uploadFile(file: File, folder: string): Promise<FileUploadResult> {
  try {
    if (!ALLOWED.includes(file.type)) return { url: null, error: '이미지 또는 PDF만 업로드할 수 있습니다.' };
    if (file.size > MAX_BYTES) return { url: null, error: '20MB 이하 파일만 업로드할 수 있습니다.' };
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const rand = Math.random().toString(36).slice(2, 9);
    const path = `${folder}/${Date.now()}-${rand}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      const msg = /mime|allowed/i.test(error.message)
        ? '허용되지 않는 형식입니다. (스토리지 버킷 허용 형식에 application/pdf 를 추가해주세요)'
        : error.message;
      return { url: null, error: msg };
    }
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : '파일 업로드에 실패했습니다.' };
  }
}

// Supabase API 공용 코어: Result 래퍼 · 에러 정규화 · 실행기 · 관리자명
import { supabase } from '../supabaseClient';

export interface Result<T> {
  data: T | null;
  error: string | null;
}

export const ok = <T>(data: T): Result<T> => ({ data, error: null });
export const fail = <T = never>(error: string): Result<T> => ({ data: null, error });

// DB/네트워크 에러를 사용자용 한글 메시지로 변환
export function mapError(error: any): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.';
  const code: string | undefined = error.code;
  const msg: string = error.message || '';

  switch (code) {
    case '42P01': return '데이터 테이블이 없습니다. 마이그레이션 SQL을 먼저 적용해주세요.';
    case '42703': return '필요한 컬럼이 없습니다. 최신 마이그레이션 SQL을 적용해주세요.';
    case '42501': return '권한이 없습니다. 관리자 계정으로 로그인했는지 확인해주세요.';
    case '23505': return '이미 동일한 항목이 존재합니다.';
    case '23503': return '연결된 다른 데이터가 있어 처리할 수 없습니다.';
    case '23502': return '필수 입력값이 비어 있습니다.';
    case '23514': return '허용되지 않는 값이 포함되어 있습니다.';
    case '22P02': return '잘못된 형식의 값이 있습니다.';
    case 'PGRST116': return '해당 데이터를 찾을 수 없습니다.';
    case 'PGRST301':
    case '401': return '인증이 필요합니다. 다시 로그인해주세요.';
    default: break;
  }
  if (/Failed to fetch|NetworkError|network|fetch/i.test(msg)) return '네트워크 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  if (/JWT|permission|RLS|row-level|not authorized/i.test(msg)) return '권한 또는 인증 오류가 발생했습니다. 다시 로그인해주세요.';
  return msg || '요청 처리 중 오류가 발생했습니다.';
}

// Supabase 쿼리({data,error}) 또는 네트워크 예외를 통합 처리
export async function run<T>(op: () => Promise<{ data: T | null; error: any }>): Promise<Result<T>> {
  try {
    const { data, error } = await op();
    if (error) { console.error('[api]', error); return fail(mapError(error)); }
    return ok((data ?? null) as T);
  } catch (e) {
    console.error('[api] unexpected', e);
    return fail(mapError(e));
  }
}

// 등록자/수정자 기록용 현재 관리자 표시명
export async function currentAdminName(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.user_metadata?.name || user?.email || '관리자';
  } catch {
    return '관리자';
  }
}

// 신규 항목 display_order(맨 뒤). 실패 시 0
export async function nextOrder(table: string): Promise<number> {
  try {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

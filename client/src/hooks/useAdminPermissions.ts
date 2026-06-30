import { useEffect, useState } from 'react';
import { getMyPermissions, type ActionPerm } from '../api/systemApi';

// 로그인 관리자의 부서 권한을 로드하고 메뉴/액션 접근 여부를 판단
export function useAdminPermissions() {
  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [perms, setPerms] = useState<Record<string, ActionPerm>>({});

  useEffect(() => {
    let alive = true;
    getMyPermissions().then((p) => {
      if (!alive) return;
      setIsSuper(p.isSuper);
      setPerms(p.perms);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  // 메뉴키 권한 (action: r/c/u/d, 기본 조회)
  const can = (key: string, action: keyof ActionPerm = 'r') => isSuper || !!perms[key]?.[action];
  // 그룹(1Depth) 표시 여부: 하위 키 중 하나라도 조회 가능하면 노출
  const canGroup = (keys: string[]) => isSuper || keys.some((k) => !!perms[k]?.r);

  return { loading, isSuper, perms, can, canGroup };
}

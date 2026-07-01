import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Plus, X } from 'lucide-react';
import { productApi, brandApi, rentalCategoryApi, orderApi, ORDER_LABEL, type ProductOption, type RentalOrder } from '../../../api/rentalApi';
import ToggleButton from '../../../components/UI/ToggleButton';
import ImageUploader from '../../../components/UI/ImageUploader';
import RichTextEditor from '../../../components/UI/RichTextEditor';
import { inputStyle, labelStyle, btnPrimary, btnGhost, useAdminModal, Spinner, fmtDate, DetailHead, StatusPill, FormSection, Row, Field, TextField, FormActions } from '../../../components/admin/shared';

const won = (n: number) => `₩${Number(n || 0).toLocaleString()}`;
const LIST = '/admin/dashboard/rental/products';
const nativeSel: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

const RentalProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isNew = id === 'new';
  const mode = params.get('mode'); // 'exclusive' | 'event' (등록 화면 진입 시 프리셋)

  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [allCats, setAllCats] = useState<{ id: number; name: string; brand_id: number | null; parent_id: number | null }[]>([]);
  const [brandId, setBrandId] = useState<number | ''>('');
  const [parentCatId, setParentCatId] = useState<number | ''>(''); // 1차
  const [categoryId, setCategoryId] = useState<number | ''>('');    // 2차(없으면 1차로 저장)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [dailyPrice, setDailyPrice] = useState('0');
  const [deposit, setDeposit] = useState('0');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [stock, setStock] = useState('0');
  const [minDays, setMinDays] = useState('1');
  const [maxDays, setMaxDays] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isExclusive, setIsExclusive] = useState(false);
  const [isEvent, setIsEvent] = useState(false);
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { element: modal, alert } = useAdminModal();

  useEffect(() => {
    (async () => {
      const [{ data: b }, { data: c }] = [await brandApi.listActive(), await rentalCategoryApi.list()];
      const blist = (b || []) as { id: number; name: string }[];
      setBrands(blist);
      const catList = ((c || []) as any[]).map((x) => ({ id: x.id, name: x.name, brand_id: x.brand_id, parent_id: x.parent_id ?? null }));
      setAllCats(catList);
      if (!isNew) {
        const { data, error } = await productApi.get(id!);
        if (error) alert('불러오기 오류', error);
        if (data) {
          setBrandId(data.brand_id ?? '');
          const cat = catList.find((x) => x.id === data.category_id);
          if (cat?.parent_id) { setParentCatId(cat.parent_id); setCategoryId(cat.id); }
          else { setParentCatId(data.category_id ?? ''); setCategoryId(''); }
          setName(data.name); setDescription(data.description || '');
          setImages(Array.isArray(data.images) ? data.images : []);
          setDailyPrice(String(data.daily_price ?? 0)); setDeposit(String(data.deposit ?? 0));
          setDeliveryFee(String(data.delivery_fee ?? 0)); setStock(String(data.stock ?? 0));
          setMinDays(String(data.min_days ?? 1)); setMaxDays(data.max_days == null ? '' : String(data.max_days));
          setOptions(Array.isArray(data.options) ? data.options : []);
          setIsActive(data.is_active);
          setIsExclusive(!!data.is_exclusive);
          setIsEvent(!!data.is_event);
        }
        const { data: ord } = await orderApi.listByProduct(Number(id));
        setOrders(ord || []);
      } else {
        if (blist.length) setBrandId(blist[0].id);
        if (mode === 'exclusive') setIsExclusive(true);
        if (mode === 'event') setIsEvent(true);
      }
      setLoading(false);
    })();
  }, [id, isNew, alert, mode]);

  const firstCats = useMemo(() => allCats.filter((c) => c.brand_id === (brandId === '' ? null : brandId) && !c.parent_id), [allCats, brandId]);
  const secondCats = useMemo(() => allCats.filter((c) => c.parent_id === (parentCatId === '' ? -1 : parentCatId)), [allCats, parentCatId]);

  const save = async () => {
    if (!name.trim()) return alert('입력 필요', '상품명을 입력해주세요.');
    setSaving(true);
    const finalCat = categoryId !== '' ? Number(categoryId) : (parentCatId !== '' ? Number(parentCatId) : null);
    const input = {
      brand_id: brandId === '' ? null : Number(brandId),
      category_id: finalCat,
      name, description, images, thumbnail_url: images[0],
      daily_price: Number(dailyPrice), deposit: Number(deposit), delivery_fee: Number(deliveryFee),
      stock: Number(stock), min_days: Number(minDays), max_days: maxDays === '' ? null : Number(maxDays),
      options, is_active: isActive, is_exclusive: isExclusive, is_event: isEvent,
    };
    const { error } = isNew ? await productApi.create(input) : await productApi.update(id!, input);
    setSaving(false);
    if (error) alert('저장 오류', error); else alert('저장 완료', '저장되었습니다.', () => navigate(LIST));
  };

  if (loading) return <Spinner />;

  const setOpt = (i: number, patch: Partial<ProductOption>) => setOptions((arr) => arr.map((o, idx) => idx === i ? { ...o, ...patch } : o));
  const badgeText = isExclusive ? '단독 상품' : isEvent ? '기획전' : isActive ? '판매중' : '판매중지';
  const badgeColor = !isActive ? '#94a3b8' : isExclusive ? '#7c3aed' : isEvent ? '#db2777' : '#059669';

  return (
    <div style={{ maxWidth: '880px' }}>
      <DetailHead
        title={isNew ? '상품 등록' : '상품 수정'}
        onBack={() => navigate(LIST)}
        badge={!isNew ? <StatusPill label={badgeText} color={badgeColor} /> : undefined}
        right={<button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>}
      />

      <FormSection title="분류">
        <Row>
          <Field label="브랜드" required>
            <select style={nativeSel} value={brandId} onChange={(e) => { setBrandId(e.target.value === '' ? '' : Number(e.target.value)); setParentCatId(''); setCategoryId(''); }}>
              <option value="">브랜드 선택</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="1차 카테고리" required>
            <select style={nativeSel} value={parentCatId} onChange={(e) => { setParentCatId(e.target.value === '' ? '' : Number(e.target.value)); setCategoryId(''); }} disabled={brandId === ''}>
              <option value="">{brandId === '' ? '브랜드 먼저 선택' : '1차 카테고리 선택'}</option>
              {firstCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={secondCats.length === 0 ? '2차 카테고리 (하위 없음 · 1차로 등록)' : '2차 카테고리'}>
            <select style={nativeSel} value={categoryId} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))} disabled={parentCatId === '' || secondCats.length === 0}>
              <option value="">{secondCats.length === 0 ? '없음' : '2차 카테고리 선택'}</option>
              {secondCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </Row>
      </FormSection>

      <FormSection title="상품 정보">
        <Row><TextField label="상품명" required minWidth="100%" value={name} onChange={setName} placeholder="예: 요기보 맥스" /></Row>
        <Field label="상품 이미지 (첫 번째가 대표 이미지)" minWidth="100%">
          <ImageUploader value={images} onChange={setImages} folder="rental-product" multiple max={8} />
        </Field>
        <div style={{ marginTop: '14px' }}>
          <label style={labelStyle}>상품 설명</label>
          <RichTextEditor value={description} onChange={setDescription} placeholder="상품 상세 설명" />
        </div>
      </FormSection>

      <FormSection title="가격 · 렌탈 정보" desc="가격 = 일일 단가 × 대여일수">
        <Row>
          <TextField label="일일 단가 (원)" required type="number" value={dailyPrice} onChange={setDailyPrice} />
          <TextField label="보증금 (원)" type="number" value={deposit} onChange={setDeposit} />
          <TextField label="배송/설치비 (원)" type="number" value={deliveryFee} onChange={setDeliveryFee} />
        </Row>
        <Row>
          <TextField label="재고 수량" type="number" value={stock} onChange={setStock} />
          <TextField label="최소 대여일" type="number" value={minDays} onChange={setMinDays} />
          <TextField label="최대 대여일 (비우면 무제한)" type="number" value={maxDays} onChange={setMaxDays} placeholder="무제한" />
        </Row>
      </FormSection>

      <FormSection title="상품 옵션" desc="옵션명 + 추가 금액">
        {options.map((o, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 2 }} placeholder="옵션명 (예: 컬러 - 그레이)" value={o.name} onChange={(e) => setOpt(i, { name: e.target.value })} />
            <input type="number" style={{ ...inputStyle, flex: 1, textAlign: 'right' }} placeholder="추가금액" value={o.add_price} onChange={(e) => setOpt(i, { add_price: Number(e.target.value) })} />
            <button onClick={() => setOptions((arr) => arr.filter((_, idx) => idx !== i))} style={{ background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><X size={16} color="#dc2626" /></button>
          </div>
        ))}
        <button onClick={() => setOptions((arr) => [...arr, { name: '', add_price: 0 }])} style={{ ...btnGhost, marginTop: '4px' }}><Plus size={16} /> 옵션 추가</button>
      </FormSection>

      <FormSection title="노출 설정">
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>활성화(판매중)</label>
            <ToggleButton isOn={isActive} onToggle={() => setIsActive((v) => !v)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>단독 상품</label>
            <ToggleButton isOn={isExclusive} onToggle={() => setIsExclusive((v) => !v)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>기획전</label>
            <ToggleButton isOn={isEvent} onToggle={() => setIsEvent((v) => !v)} />
          </div>
        </div>
        <FormActions>
          <button style={btnGhost} onClick={() => navigate(LIST)}>취소</button>
          <button style={btnPrimary} onClick={save} disabled={saving}><Save size={16} /> {saving ? '저장 중...' : '저장'}</button>
        </FormActions>
      </FormSection>

      {/* 렌탈 현황 (수정 시) */}
      {!isNew && (
        <FormSection title={`렌탈 현황 (${orders.length}건)`}>
          {orders.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', padding: '12px 0' }}>아직 이 상품의 렌탈 결제 내역이 없습니다.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>대여 시작</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>일수</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>고객</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>결제액</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 10px' }}>{o.rental_start ? fmtDate(o.rental_start) : '-'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{o.rental_days}일</td>
                      <td style={{ padding: '8px 10px' }}>{o.customer_name || '-'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{won(o.total_amount)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>{ORDER_LABEL[o.order_status]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </FormSection>
      )}
      {modal}
    </div>
  );
};

export default RentalProductDetail;

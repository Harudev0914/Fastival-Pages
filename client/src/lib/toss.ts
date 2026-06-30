// 토스페이먼츠 결제 요청 헬퍼 (결제창 호출 → successUrl/failUrl 로 리다이렉트)
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

// 공개키(클라이언트 키). 미설정 시 토스 공식 테스트 키 사용
const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

export interface TossPaymentParams {
  orderId: string;
  orderName: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerMobilePhone?: string;
}

export async function requestTossPayment(p: TossPaymentParams): Promise<void> {
  const toss = await loadTossPayments(CLIENT_KEY);
  const payment = toss.payment({ customerKey: ANONYMOUS });
  const origin = window.location.origin;
  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: p.amount },
    orderId: p.orderId,
    orderName: p.orderName,
    successUrl: `${origin}/rental/payment/success`,
    failUrl: `${origin}/rental/payment/fail`,
    customerName: p.customerName,
    customerEmail: p.customerEmail || undefined,
    customerMobilePhone: p.customerMobilePhone?.replace(/[^0-9]/g, '') || undefined,
    card: { useEscrow: false, flowMode: 'DEFAULT', useCardPoint: false, useAppCardOnly: false },
  });
}

// 고유 주문번호 생성 (영문/숫자/-/_ , 6~64자)
export function genOrderId(): string {
  return `klipse_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

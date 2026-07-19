# Project Tasks

현재 코드와 제품 상태를 기준으로 정리한 작업 목록입니다. 위에서 아래로 우선순위가 높습니다.

## P0 — 데이터 안전성과 운영 준비

- [ ] 체크리스트 API의 `POST`/`PATCH` body를 런타임 스키마로 검증
- [ ] 인증 방식과 사용자 식별 모델 확정
- [ ] Supabase `preparation_items` 및 `exchange_rates` RLS 정책 검토·문서화
- [ ] API 오류 응답 형식을 통일하고 클라이언트에 구체적인 실패 상태 표시

## P1 — 구조와 품질

- [ ] `ChecklistActivity.tsx`를 데이터 훅, mutation 훅, 진행률, 목록 항목 컴포넌트로 분리
- [ ] 준비물 타입과 사용자 ID 상수를 공용 도메인 모듈로 이동
- [ ] 준비물 완료율 및 담당자별 삭제 로직에 단위 테스트 추가
- [ ] 체크리스트 API에 route 테스트 추가
- [ ] 사용하지 않는 `components/ui`와 예제 컴포넌트 조사 및 정리
- [ ] HeroUI, Base UI, Animate UI의 사용 경계를 확정

## P1 — 제품 완성도

- [ ] `app/layout.tsx`의 기본 Create Next App 메타데이터를 제품 정보로 변경
- [ ] 문서 언어를 `ko`로 변경
- [ ] PWA 이름, 설명, 테마 색상 및 192/512px 아이콘 추가
- [ ] 설치 확인용 `HeroUI ready` 버튼 제거
- [ ] BottomNav를 실제 `button` 기반의 접근 가능한 내비게이션으로 교체
- [ ] 빈 상태, 조회 실패, mutation 실패 UI를 화면별로 통일

## P2 — 실제 기능 전환

- [ ] 일정 데이터를 Supabase 또는 별도 데이터 소스로 이전
- [ ] 홈의 여행 상태를 실제 여행 날짜에서 계산
- [ ] 환율 데이터의 갱신 주기와 출처를 명시
- [ ] 재촉 API를 Web Push, APNs 또는 FCM 구현으로 교체
- [ ] 회화 음성 인식 미지원 브라우저의 fallback UX 추가
- [ ] 발견 화면의 맛집·쇼핑 데이터를 관리 가능한 모델로 이전

## Backlog

- [ ] Cult UI Tweet Grid 적용 가능성 검토
- [ ] 향후 대시보드 화면을 위한 Skiper UI 검토

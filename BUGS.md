# Project Bugs

재현 가능한 기능 문제와 현재 확인된 코드 경고를 기록합니다. 장기 개선 작업은 [TASKS.md](./TASKS.md)에 둡니다.

## Open Issues

### ExchangeActivity의 stale closure 가능성

- 파일: `activities/ExchangeActivity.tsx`
- 상태: 확인 필요
- 내용: 환율 계산에 사용하는 `useCallback`이 `rates`를 참조하지만 dependency 배열에 포함하지 않습니다.
- 영향: 환율 데이터가 갱신된 뒤에도 이전 환율로 계산할 수 있습니다.

### 제품 화면에 HeroUI 설치 확인 버튼 노출

- 파일: `app/page.tsx`
- 상태: 제거 필요
- 내용: 우측 상단에 `HeroUI ready` 버튼이 고정 표시됩니다.
- 영향: 실제 앱 화면과 겹치거나 사용자가 제품 기능으로 오인할 수 있습니다.

### 기본 제품 메타데이터 노출

- 파일: `app/layout.tsx`, `app/manifest.ts`
- 상태: 수정 필요
- 내용: `Create Next App`, `Stackflow PWA App` 등의 기본 이름과 설명이 남아 있습니다.
- 영향: 브라우저, 홈 화면 설치, 공유 미리보기에서 잘못된 제품 정보가 표시됩니다.

## Tooling Warnings

`npm run lint` 기준 오류는 없고 다음 경고가 있습니다.

- `activities/ExchangeActivity.tsx`: 미사용 `ExchangeRate` 타입
- `activities/ExchangeActivity.tsx`: React hook dependency에서 `rates` 누락
- `activities/ExchangeActivity.tsx`: 최적화되지 않은 `<img>` 사용
- `components/core/text-effect.tsx`: 미사용 변수 `_`

## Known Limitations

다음 항목은 현재 의도된 mock 또는 미구현 상태이며 기능 버그로 분류하지 않습니다.

- `/api/checklist/nudge`는 실제 푸시 알림을 보내지 않습니다.
- 일정, 홈, 회화, 발견 화면은 정적 데모 데이터를 포함합니다.
- 인증과 API 런타임 스키마 검증이 아직 없습니다.
- 자동화 테스트가 아직 없습니다.

# 할일 목록 — 사이트 자동화·관리·최신화·안정화

대상: [은퇴 현금흐름 시뮬레이터 (GitHub Pages)](https://heo-j-h.github.io/life-after-60/)

체크하면 진행 상황을 추적할 수 있습니다.

## 배포 (자동화 기본)

- [ ] GitHub 저장소 **Settings → Pages**에서 소스가 의도한 브랜치·폴더(`main` / root 또는 `/docs`)인지 확인
- [ ] 로컬 변경 후 **`git push`만으로** 사이트가 갱신되는지 한 번 확인 (수동 업로드·다른 브랜치 배포와 혼선 없게)
- [ ] (선택) 커스텀 도메인 사용 시 DNS·Pages 설정 문서화

## CI / 품질 (안정화)

- [x] `.github/workflows/weekly-maintenance.yml` — 매주 월요일(UTC) `node --check` + `site-weekly-meta.json` 커밋·푸시 (Pages 재배포 트리거). **내용(법규·UI) 자동 변경 없음.**
- [ ] (선택) PR/푸시용 별도 워크플로: 매 커밋마다 동일 JS 검사만
- [ ] (선택) HTML 기본 검증 도구 연동 (예: `html-validate` 등, 필요 시 `package.json` 도입)
- [ ] (선택) 배포 전 `PUBLISH_STAMP` 또는 빌드 시각 자동 갱신 스크립트 + Actions 연동

## 저장소 운영 (관리)

- [ ] `main` 브랜치 **보호 규칙**: 직접 푸시 제한 또는 PR 필수, **필수 상태 검사**에 위 CI 워크플로 연결
- [ ] 큰 기능은 **PR**로 나누고, 머지 전 로컬에서 시뮬·주요 시나리오 스모크 테스트
- [ ] (선택) GitHub **Releases**로 사용자용 변경 요약 짧게 남기기

## 캐시·체감 품질 (선택)

- [ ] 정적 자산 캐시 이슈 시 **쿼리 버전**(`?v=커밋해시`) 또는 파일명 버전 전략 검토
- [ ] (선택) 외부 가용성 모니터링 (예: 주기적 GET 헬스체크)

## 법규·문구 최신화 (도구 특성)

- [ ] `regulatory-reference.js`의 **REVIEW_STAMP** 및 법령 요약 주기적 대조 (law.go.kr·국세청·협회 안내 등)
- [ ] `REFERENCE_HUB_SECTIONS` 등 참고 링크 URL 깨짐 여부 가끔 확인

---

완료한 항목은 `- [ ]`를 `- [x]`로 바꾸면 됩니다.

# life-after-60
60세 은퇴 목표 자산 시뮬레이션 및 년월별 현금흐름 분석 도구

## 버전 표시 (`Ver. yyyy.MM.dd HH:mm`)

헤더의 빌드 시각은 `index.html` 안의 `PUBLISH_STAMP`입니다.  
커밋할 때마다 자동으로 갱신하려면(최초 1회):

```bash
git config core.hooksPath githooks
```

이후 동작:

- `git commit`: `githooks/pre-commit`이 **커밋 시각**으로 `PUBLISH_STAMP`와 헤더 정적 `Ver.` 문자열을 맞추고 `index.html`을 스테이징합니다.
- `git push`: `githooks/pre-push`가 **푸시 직전 시각**으로 다시 맞춘 뒤, 변경이 있으면 **마지막 커밋을 amend**합니다(푸시하는 시각이 화면 `Ver.`와 일치).

## 매주 자동 점검·배포 트리거 (신경 덜 쓰는 쪽)

저장소에 **GitHub Actions**가 켜져 있으면, [`.github/workflows/weekly-maintenance.yml`](.github/workflows/weekly-maintenance.yml)이 **매주 월요일 00:00 UTC**(한국 시간 월요일 오전 9시경)에:

1. 저장소 안의 모든 `.js`에 대해 `node --check`로 문법 검사
2. 통과 시 `site-weekly-meta.json`만 최신 시각으로 갱신 후 `main`에 푸시 → **GitHub Pages가 다시 배포**됩니다(캐시·배포 주기를 일정하게 맞추는 용도).

**자동으로 하지 않는 것:** 조세·연금·ISA 등 **법규 요약 문구**, 시뮬 공식, UI/UX 개선. 그 부분은 잘못 배포될 위험이 있어 **사람이 `regulatory-reference.js` 등을 검토**하는 흐름을 유지하는 것이 좋습니다.

수동으로 한 번 돌려보기: GitHub → **Actions** → **Weekly maintenance** → **Run workflow**.

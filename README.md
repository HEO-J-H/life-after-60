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

### 소유자가 웹에서 딱 한 번만 할 일 (봇이 `main`에 푸시하려면 필요)

로컬 `git push`까지는 개발 PC에서 하면 되고, **주간 워크플로가 `site-weekly-meta.json`을 커밋·푸시**하려면 GitHub 쪽에서 권한을 한 번 열어줘야 합니다.

1. **[Actions 일반 설정](https://github.com/HEO-J-H/life-after-60/settings/actions)** 으로 이동 (저장소 관리 권한 필요).
2. 아래로 내려 **Workflow permissions**에서 **Read and write permissions**를 선택하고 저장합니다.
3. 같은 페이지에서 Actions 사용이 꺼져 있으면 **Allow all actions** 등으로 켭니다.

이후에는 매주 워크플로가 실패 없이 돌면 자동으로 커밋이 쌓입니다.

---

저장소에 **GitHub Actions**가 켜져 있으면, [`.github/workflows/weekly-maintenance.yml`](.github/workflows/weekly-maintenance.yml)이 **매주 월요일 00:00 UTC**(한국 시간 월요일 오전 9시경)에:

1. 저장소 안의 모든 `.js`에 대해 `node --check`로 문법 검사
2. 통과 시 `site-weekly-meta.json`만 최신 시각으로 갱신 후 `main`에 푸시 → **GitHub Pages가 다시 배포**됩니다(캐시·배포 주기를 일정하게 맞추는 용도).

**자동으로 하지 않는 것:** 조세·연금·ISA 등 **법규 요약 문구**, 시뮬 공식, UI/UX 개선. 그 부분은 잘못 배포될 위험이 있어 **사람이 `regulatory-reference.js` 등을 검토**하는 흐름을 유지하는 것이 좋습니다.

수동으로 한 번 돌려보기: GitHub → **Actions** → **Weekly maintenance** → **Run workflow**.

## CI (푸시·PR)

[`tools/smoke-check.cjs`](tools/smoke-check.cjs)가 모든 `.js`에 `node --check`를 돌리고, `index.html`의 중복 `id`·`regulatory-reference.js` 포함 여부를 검사합니다.  
[`.github/workflows/ci.yml`](.github/workflows/ci.yml)이 `main`/`master` 푸시·PR마다 실행됩니다.

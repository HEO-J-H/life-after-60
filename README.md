# life-after-60
60세 은퇴 목표 자산 시뮬레이션 및 년월별 현금흐름 분석 도구

## 버전 표시 (`Ver. yyyy.MM.dd HH:mm`)

헤더의 빌드 시각은 `index.html` 안의 `PUBLISH_STAMP`입니다.  
커밋할 때마다 자동으로 갱신하려면(최초 1회):

```bash
git config core.hooksPath githooks
```

이후 `git commit` 시 `githooks/pre-commit`이 현재 시각으로 `PUBLISH_STAMP`를 맞추고 `index.html`을 스테이징합니다.

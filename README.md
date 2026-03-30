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

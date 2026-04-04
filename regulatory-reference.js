/**
 * regulatory-reference.js — 세법·연금·공제 요약 (도구 안내용, 법률 자문 아님)
 * 수정 시: REVIEW_STAMP 갱신 + law.go.kr·국세청·금융위·금융투자협회·과학기술인공제회·고용노동부 병행 확인
 */
(function (global) {
  'use strict';

  var REVIEW_STAMP = '2026-04-02';

  var AS_OF_NOTE =
    '<span class="legal-asof-note">(안내 기준: <b>' +
    REVIEW_STAMP +
    '</b> 시점 법령·고시 <b>일반 요지</b> — 개정·해석·개별 사정에 따라 달라질 수 있음)</span>';

  /** 직업군 마스터: 칩·셀렉트·AI 요약·시나리오 힌트·버튼 라벨을 한곳에서 */
  var JOB_TYPE_OPTIONS = [
    {
      id: 'employee',
      chipLabel: '직장인',
      selectLabel: '직장인 (급여소득)',
      aiSummaryLabel: '직장인(급여소득)',
      scenarioHintLabel: '직장인',
    },
    {
      id: 'researcher',
      chipLabel: '연구·R&D',
      selectLabel: '연구원·R&D (과학기술인공제 등)',
      aiSummaryLabel: '연구원·R&D(과학기술인공제·퇴직연금 등 병행 가능)',
      scenarioHintLabel: '연구원·R&D',
    },
    {
      id: 'civil',
      chipLabel: '공무원·교직·군경',
      selectLabel: '공무원·교직·군인 등 공적연금 대상',
      aiSummaryLabel: '공무원·교직·군인 등 공적연금 병행',
      scenarioHintLabel: '공무원·교직·군인',
    },
    {
      id: 'self',
      chipLabel: '자영·프리랜서',
      selectLabel: '자영업·프리랜서',
      aiSummaryLabel: '자영업·프리랜서(종합소득·노란우산공제 등)',
      scenarioHintLabel: '자영업·프리랜서',
    },
    {
      id: 'retired',
      chipLabel: '은퇴·무직',
      selectLabel: '은퇴·무직 (연금·임대·투자소득 중심)',
      aiSummaryLabel: '은퇴·기타소득 중심',
      scenarioHintLabel: '은퇴·무직',
    },
  ];

  function jobTypeAiSummaryLabel(jobType) {
    var i;
    for (i = 0; i < JOB_TYPE_OPTIONS.length; i++) {
      if (JOB_TYPE_OPTIONS[i].id === jobType) {
        return (
          JOB_TYPE_OPTIONS[i].aiSummaryLabel ||
          JOB_TYPE_OPTIONS[i].selectLabel ||
          jobType ||
          '미지정'
        );
      }
    }
    return jobType || '미지정';
  }

  function jobTypeScenarioHintLabel(jobType) {
    var i;
    for (i = 0; i < JOB_TYPE_OPTIONS.length; i++) {
      if (JOB_TYPE_OPTIONS[i].id === jobType) {
        return JOB_TYPE_OPTIONS[i].scenarioHintLabel || JOB_TYPE_OPTIONS[i].chipLabel || jobType || '';
      }
    }
    return jobType || '';
  }

  /**
   * 금융투자협회 집합투자증권(펀드) 투자위험등급 표준(제1~제6위험등급).
   * 제1등급 = 위험 최고, 제6등급 = 위험 최저(단, 상품·설명서 정의가 우선).
   */
  var FUND_RISK_GRADE_LABELS = {
    1: '매우 높은 위험',
    2: '높은 위험',
    3: '다소 높은 위험',
    4: '보통 위험',
    5: '낮은 위험',
    6: '매우 낮은 위험',
  };

  /**
   * 시뮬 입력용: 협회 위험등급 → 비보장형·장기 가정 참고 연수익률 중앙값(%).
   * 실제 펀드 수익·원금 보장 여부는 투자설명서·약관을 따릅니다.
   */
  var FUND_RISK_GRADE_REF_RR = { 1: 9.5, 2: 8, 3: 6.5, 4: 5, 5: 3.8, 6: 3.2 };

  /** @deprecated 구버전 시뮬(등급 1~5, 숫자 작을수록 보수적 가정). getDefaultOptRefRRForGrade에서 신규 1~6 우선. */
  var DEFAULT_OPTION_GRADE_REF_RR = { 1: 3.2, 2: 4.5, 3: 6, 4: 8, 5: 9.5 };

  function buildAIRegulatoryBlock(jobType) {
    var jtLabel = jobTypeAiSummaryLabel(jobType);
    return (
      '[법령·제도 요약 — ' +
      REVIEW_STAMP +
      ' 검토, 일반 안내]\n' +
      '직업군(기본정보): ' +
      jtLabel +
      '\n' +
      '· 연금저축·적립IRP: 납입액 소득공제(소득세법·조세특례제한법, 연간 한도·연금계좌 합산 납입 상한 등)\n' +
      '· 과학기술인공제회 퇴직연금: 회원(개인)부담금 등 연금적 납입의 세제는 소득세법 등 및 공제회 안내\n' +
      '· 퇴직IRP·DC: 퇴직급여 이연·운용지시·디폴트옵션 등은 근로자퇴직급여 보장법령·금융위 고시·약관. ' +
      '펀드 위험등급은 금융투자협회 표준(제1~제6위험등급)을 따르나 상품별 표기는 설명서 확인\n' +
      '· ISA: 조특법 금융투자소득 비과세·분리과세·의무가입기간·금융소득 종합과세 관계\n' +
      '· 노란우산공제: 조특법상 사업자 등 납입 소득공제(종합소득금액 구간별 공제 한도 차등, 연도별 개정)\n' +
      '답변 시 계좌 유형과 연결하고, 확정 세액·법률 자문이 아님을 명시. 홈택스·국세청·가입 기관 최종 확인.'
    );
  }

  function htmlDefaultOptionBlock() {
    var rows = '';
    for (var g = 1; g <= 6; g++) {
      var rr = FUND_RISK_GRADE_REF_RR[g];
      rows +=
        '<tr><td><b>제' +
        g +
        '위험등급</b></td><td>' +
        (FUND_RISK_GRADE_LABELS[g] || '—') +
        '</td><td>약 ' +
        rr +
        '%/년 <span style="color:var(--t3)">(시뮬 참고 중앙값)</span></td></tr>';
    }
    return (
      '<p style="margin:0 0 8px 0;line-height:1.65;">' +
      '<b>집합투자증권(펀드) 투자위험등급</b>은 <b>금융투자협회</b>가 정한 표준에 따라, ' +
      '국내에서 판매되는 <b>금융투자상품(펀드 등)</b>에 공통적으로 부여되는 <b>제1~제6위험등급</b> 체계입니다. ' +
      '숫자가 작을수록 일반적으로 <b>주식 등 변동성 큰 자산 비중이 큰 편</b>에 해당할 수 있으나, ' +
      '<b>투자설명서·약관·집합투자규약</b>의 정의·산출이 우선합니다. ' +
      '퇴직연금·IRP의 「디폴트옵션」 상품도 이 위험등급 체계로 안내되는 경우가 많습니다. ' +
      AS_OF_NOTE +
      '</p>' +
      '<ul style="margin:0 0 0 1.1em;padding:0;line-height:1.65;">' +
      '<li><b>본 시뮬</b>은 개별 펀드명을 구분하지 않습니다. 아래 표의 연수익률은 <b>비보장·장기 가정용 참고치</b>일 뿐이며 원금 보장이 아닙니다.</li>' +
      '<li><b>자산배분·한도</b>: 퇴직연금·IRP의 안전·위험자산 비율 등은 관련 법령·금융위 고시·약관을 따릅니다.</li>' +
      '</ul>' +
      '<div class="sim-wrap" style="overflow-x:auto;margin-top:10px;">' +
      '<table class="st" style="font-size:11px;min-width:320px;">' +
      '<thead><tr><th>등급</th><th>위험도(협회 표준안)</th><th>참고 연수익률(비보장·시뮬)</th></tr></thead>' +
      '<tbody>' +
      rows +
      '</tbody></table></div>' +
      '<p class="legal-asof-note" style="margin:8px 0 0 0;">과거 실적·시장 가정에 따른 <b>비공식 범위</b>입니다. ' +
      '실제 약정수익률·원금 보장 여부는 상품별 약관을 따릅니다.</p>'
    );
  }

  function buildJobAcctGuideHtml(jobType) {
    var blocks = {
      employee:
        '<b>직장인(급여소득)</b> ' +
        AS_OF_NOTE +
        '<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.65;">' +
        '<li><b>두기 좋은 계좌</b>: ISA, 연금저축, 적립IRP, 퇴직 시 <b>퇴직IRP</b>, 직장 <b>DC/DB 퇴직연금</b>(펀드 위험등급·운용은 약관).</li>' +
        '<li><b>혜택 요지</b>: 연금저축·적립IRP 납입액 <b>소득공제</b>(연금/IRP 합산 납입 상한 등). ISA는 조건 충족 시 비과세·분리과세.</li>' +
        '<li><b>주의</b>: 연말정산에서 총급여·합산 공제 확정. 퇴직금 이전·IRP는 사업장·금융기관 절차.</li>' +
        '</ul>',
      researcher:
        '<b>연구원·R&D</b> ' +
        AS_OF_NOTE +
        '<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.65;">' +
        '<li><b>과학기술인공제회 퇴직연금</b>: 연구개발 인력 등을 위한 공제회 제도로, ' +
        '<b>회원(개인)부담금</b> 등에 대해 소득세법·조세특례제한법상 <b>연금계좌 관련 소득공제</b>가 인정되는 경우가 있습니다 ' +
        '(공제 한도·총급여 요건 등은 <b>과학기술인공제회·국세청</b> 안내). ' +
        '수령 시 <b>이연퇴직소득세 감면</b>(수령 기간 등)은 조특법 개정에 따라 달라질 수 있습니다.</li>' +
        '<li><b>그 외</b>: ISA·연금저축·적립IRP·퇴직IRP — 일반 직장인과 병행 검토. 직장 DC는 펀드 위험등급·운용은 약관 확인.</li>' +
        '<li><b>주의</b>: 소득 형태에 따라 공제 제한 가능.</li>' +
        '</ul>',
      civil:
        '<b>공무원·교직·군인 등(공적연금 병행)</b> ' +
        AS_OF_NOTE +
        '<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.65;">' +
        '<li><b>두기 좋은 계좌</b>: ISA, 연금저축, 적립IRP, 퇴직IRP(해당 시).</li>' +
        '<li><b>혜택·주의</b>: 공적연금과 별도 개인 연금·ISA는 동일 법체계에서 검토하나, 소득 유형에 따라 공제 제한 가능.</li>' +
        '</ul>',
      self:
        '<b>자영업·프리랜서</b> ' +
        AS_OF_NOTE +
        '<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.65;">' +
        '<li><b>노란우산공제</b>: 고용노동부 산하 공제회 — 납입액 <b>소득공제</b>(소득세법·조특법). ' +
        '<b>종합소득금액 구간별 공제 한도</b>가 차등(과세연도마다 법령 확인). ' +
        '가입 대상·납입 한도·지급 사유는 <b>소상공인공제회</b> 규정.</li>' +
        '<li><b>그 외</b>: ISA, 연금저축, 적립IRP — 종합소득 확정 후 소득공제 검토.</li>' +
        '<li><b>희망저축계좌 I·II</b> 등 복지저축은 가입 요건·정부적립이 제도마다 다름 — 계좌 유형으로 추가 후 약관·은행 안내 확인.</li>' +
        '<li><b>주의</b>: 필요경비·기장·부인과세에 따라 과세표준이 달라짐.</li>' +
        '</ul>',
      retired:
        '<b>은퇴·기타소득 중심</b> ' +
        AS_OF_NOTE +
        '<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.65;">' +
        '<li><b>두기 좋은 계좌</b>: ISA, 일반 투자·예금, 기존 연금·IRP 수령 설계.</li>' +
        '<li><b>주의</b>: 과세소득이 적으면 신규 연금저축 공제 효과는 제한될 수 있음.</li>' +
        '</ul>',
    };
    return blocks[jobType] || blocks.employee;
  }

  /** 상단 탭(순서·라벨만). 실제 패널 id = tab-{id} */
  var APP_NAV_TABS = [
    { id: 'basic', label: '📋 기본정보' },
    { id: 'accts', label: '💳 계좌설정' },
    { id: 'loans', label: '🏠 대출·보험' },
    { id: 'sim', label: '📈 시뮬레이션' },
    { id: 'scenario', label: '🎲 시나리오' },
    { id: 'holdings', label: '📦 투자수익 분석' },
    { id: 'ai', label: '🤖 AI 평가·상담' },
  ];

  /** 시나리오 탭: 직업군별 수익률·인출 시작 나이 프리셋 */
  var JOB_SCENARIO_PRESETS = {
    employee: {
      opt: '10',
      avg: '7',
      pes: '3',
      div: '6',
      setScwStart: null,
      msg: '직장인 균형형으로 맞췄습니다.',
    },
    researcher: {
      opt: '10',
      avg: '7',
      pes: '3',
      div: '6',
      setScwStart: null,
      msg: '연구원·R&D(직장인 유사) 균형형으로 맞췄습니다.',
    },
    self: {
      opt: '12',
      avg: '7.5',
      pes: '2',
      div: '5.5',
      setScwStart: null,
      msg: '매출·이익 변동 가정: 낙관·비관 폭을 넓혔습니다.',
    },
    civil: {
      opt: '9',
      avg: '6.5',
      pes: '4',
      div: '5.5',
      setScwStart: 'retireAge',
      msg: '보수적 수익률 + 「꺼내기 시작 나이」를 은퇴 나이({ra}세)에 맞췄습니다.',
    },
    retired: {
      opt: '6',
      avg: '5',
      pes: '3',
      div: '4.5',
      setScwStart: 'currentClamp65',
      msg: '은퇴 후 소득·지출 중심 가정 + 「꺼내기 시작 나이」를 현재 연령 기준으로 조정했습니다.',
    },
  };

  var JOB_SCENARIO_PRESET_BUTTONS = [
    { mode: 'employee', label: '직장인 · 균형' },
    { mode: 'researcher', label: '연구원·R&D · 균형' },
    { mode: 'self', label: '자영업 · 변동성↑' },
    { action: 'addSelfBizLumpExample', label: '자영업 · 사업정리 목돈(예시)' },
    { mode: 'civil', label: '공무원·공적연금 · 보수적' },
    { mode: 'retired', label: '은퇴·무직 · 소득형' },
    {
      action: 'applyJobScenarioPresetFromBasic',
      label: '기본정보 직업군에 맞추기',
      btnClass: 'btn btn-gold btn-sm',
      style: 'margin-left:auto;',
    },
  ];

  /** AI 탭 분석 중점 드롭다운 */
  var AI_FOCUS_OPTIONS = [
    { value: 'overall', label: '전반적 종합 분석' },
    { value: 'tax', label: '세금 최적화' },
    { value: 'div', label: '배당 전략 최적화' },
    { value: 'retire', label: '은퇴 가능성' },
    { value: 'isa', label: 'ISA 전략' },
    { value: 'loan', label: '대출·보험 최적화' },
  ];

  /** 계좌 추가 드롭다운: 그룹 + 행(퇴직IRP는 목록 제외 — 기본 제공) */
  var ACCOUNT_ADD_GROUPS = [
    {
      group: '절세 계좌',
      rows: [
        { type: 'ISA_BRK', label: 'ISA 중개형 — 비과세 200만원' },
        { type: 'ISA_GEN', label: 'ISA 일반형 — 비과세 200만원' },
        { type: 'ISA_WKR', label: 'ISA 서민형 — 비과세 400만원' },
        { type: 'PENSION_FUND', label: '연금저축펀드 — 세액공제 16.5/13.2%' },
        { type: 'PENSION_SEMA', label: '과학기술인공제 — 연구원·R&D 회원부담 등' },
        { type: 'PENSION_INS', label: '연금저축보험' },
        { type: 'IRP_ACCUM', label: '적립IRP — 추가 세액공제' },
      ],
    },
    {
      group: '일반',
      rows: [
        { type: 'STOCKS', label: '주식계좌' },
        { type: 'SUBSCRIPTION', label: '청약저축' },
        { type: 'CMA', label: 'CMA' },
        { type: 'DEPOSIT', label: '예금·적금' },
        { type: 'GENERAL', label: '일반계좌' },
      ],
    },
    {
      group: '복지·서민(요건 확인)',
      rows: [
        { type: 'HOPE_SAVE_I', label: '희망저축계좌 I' },
        { type: 'HOPE_SAVE_II', label: '희망저축계좌 II' },
        { type: 'DISABLED', label: '장애인전용저축' },
      ],
    },
    {
      group: '특수',
      rows: [
        { type: 'YELLOW_UMBRELLA', label: '노란우산공제 — 사업자 소득공제' },
        { type: 'YOUTH_LEAP', label: '청년도약계좌' },
        { type: 'CUSTOM', label: '사용자정의 ★' },
      ],
    },
  ];

  var ISA_TYPES = ['ISA_BRK', 'ISA_GEN', 'ISA_WKR'];

  function evalAccountAddRow(type, accounts) {
    var active = (accounts || []).filter(function (a) {
      return a.active;
    });
    if (ISA_TYPES.indexOf(type) >= 0) {
      var hasIsa = active.some(function (a) {
        return ISA_TYPES.indexOf(a.type) >= 0;
      });
      if (hasIsa) {
        return {
          disabled: true,
          title:
            '이미 ISA 유형 계좌가 있습니다. 실제 제도는 금융사당 ISA 1개이며, 시뮬에서도 중복 추가를 막았습니다.',
        };
      }
    }
    return {};
  }

  /** 맞춤 계좌 빠르게 추가 — 직업군별 제안 행 (flags: hasIsa, hasPen, …) */
  var JOB_ACCT_SUGGEST_ROWS = {
    retired: [
      { type: 'ISA_BRK', mo: 200000, rr: 6.5, skipIf: 'hasIsa' },
      { type: 'DEPOSIT', mo: 0, rr: 3, skipIf: 'hasFreeOrStock' },
    ],
    self: [
      { type: 'ISA_BRK', mo: 250000, rr: 7, skipIf: 'hasIsa' },
      { type: 'PENSION_FUND', mo: 350000, rr: 6.5, skipIf: 'hasPen' },
      { type: 'IRP_ACCUM', mo: 150000, rr: 6.5, skipIf: 'hasIrpAccum' },
      { type: 'YELLOW_UMBRELLA', mo: 100000, rr: 3.5, skipIf: 'hasYellow' },
    ],
    researcher: [
      { type: 'ISA_BRK', mo: 300000, rr: 7, skipIf: 'hasIsa' },
      { type: 'PENSION_SEMA', mo: 350000, rr: 6.5, skipIf: 'hasSema' },
      { type: 'IRP_ACCUM', mo: 200000, rr: 6.5, skipIf: 'hasIrpAccum' },
      { type: 'IRP_RETIRE', mo: 0, rr: 6.5, skipIf: 'hasIrpRet' },
    ],
    employee: [
      { type: 'ISA_BRK', mo: 300000, rr: 7, skipIf: 'hasIsa' },
      { type: 'PENSION_FUND', mo: 400000, rr: 6.5, skipIf: 'hasPen' },
      { type: 'IRP_ACCUM', mo: 200000, rr: 6.5, skipIf: 'hasIrpAccum' },
      { type: 'IRP_RETIRE', mo: 0, rr: 6.5, skipIf: 'hasIrpRet' },
    ],
  };

  function buildJobAcctSuggestList(jobType, flags) {
    var key = jobType === 'civil' ? 'employee' : jobType;
    var rows = JOB_ACCT_SUGGEST_ROWS[key];
    if (!rows) rows = JOB_ACCT_SUGGEST_ROWS.employee;
    var out = [];
    var i;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.skipIf && flags[r.skipIf]) continue;
      out.push({ type: r.type, mo: r.mo, rr: r.rr });
    }
    return out;
  }

  function buildAiFocusSelectHtml(currentValue) {
    var cv = currentValue == null ? '' : String(currentValue);
    var html = '';
    var i;
    for (i = 0; i < AI_FOCUS_OPTIONS.length; i++) {
      var o = AI_FOCUS_OPTIONS[i];
      var sel = o.value === cv ? ' selected' : '';
      html += '<option value="' + esc(o.value) + '"' + sel + '>' + esc(o.label) + '</option>';
    }
    return html;
  }

  var REFERENCE_HUB_SECTIONS = [
    {
      title: '퇴직금·DC/DB (근로자퇴직급여 보장법)',
      items: [
        {
          label: '고용노동부 노동포털 — 퇴직금 계산',
          url: 'https://labor.moel.go.kr/cmmt/calRtrmnt.do',
          law: '근로자퇴직급여 보장법·근로기준법',
          note: '법정 퇴직금 검증 후 본 시뮬 「직접 입력」에 반영',
        },
        {
          label: '고용노동부 — 퇴직급여 안내',
          url: 'https://www.moel.go.kr/index.do',
          law: '고용노동부',
          note: 'DC·DB·사업장 절차',
        },
      ],
    },
    {
      title: '국민연금·공적연금',
      items: [
        {
          label: '정부24 — 국민연금 예상 연금 모의계산',
          url: 'https://www.gov.kr/portal/service/serviceInfo/PTR000050238',
          law: '국민연금법',
          note: '예상 수령액은 공단 조회값을 기본정보에 맞추기',
        },
      ],
    },
    {
      title: '세금·이연·IRP (참고)',
      items: [
        {
          label: '국세청',
          url: 'https://www.nts.go.kr',
          law: '소득세법·조세특례제한법',
          note: '퇴직소득·연금소득·이연퇴직 등 최종은 홈택스·국세청',
        },
      ],
    },
    {
      title: '펀드 위험등급·집합투자 (금융투자협회)',
      items: [
        {
          label: '펀드정보 One-Click',
          url: 'https://fund.kofia.or.kr/index/index.html',
          law: '금융투자협회 표준',
          note: '실제 보유 펀드 등급·설명서 확인',
        },
        {
          label: '협회 법규정보 — 표준투자권유준칙 검색',
          url: 'https://law.kofia.or.kr',
          law: '표준투자권유준칙',
          note: '제1~제6위험등급 정의',
        },
      ],
    },
  ];

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function htmlReferenceHub() {
    var html = '';
    html +=
      '<p class="legal-asof-note" style="margin:0 0 10px 0;line-height:1.55;">아래 링크는 <b>검증·학습용</b>입니다. 본 시뮬은 브라우저에서만 계산하며, ' +
      '공식 기관 값과 다를 수 있습니다. ' +
      AS_OF_NOTE +
      '</p>';
    REFERENCE_HUB_SECTIONS.forEach(function (sec) {
      html += '<div style="margin-bottom:12px;">';
      html +=
        '<div style="font-weight:700;font-size:12px;color:var(--gold);margin-bottom:6px;">' +
        esc(sec.title) +
        '</div>';
      html += '<ul style="margin:0;padding-left:1.15em;line-height:1.65;font-size:11px;color:var(--t2);">';
      sec.items.forEach(function (it) {
        html += '<li style="margin-bottom:4px;">';
        html +=
          '<a href="' +
          esc(it.url) +
          '" target="_blank" rel="noopener noreferrer" style="color:var(--blue);">' +
          esc(it.label) +
          '</a>';
        if (it.law) {
          html +=
            ' <span class="legal-asof-note" style="font-size:10px;">(' + esc(it.law) + ')</span>';
        }
        if (it.note) {
          html += ' — ' + esc(it.note);
        }
        html += '</li>';
      });
      html += '</ul></div>';
    });
    return html;
  }

  function buildNewAcctSelectHtml(accounts) {
    var html = '<option value="">-- 계좌 유형 선택 --</option>';
    ACCOUNT_ADD_GROUPS.forEach(function (g) {
      html += '<optgroup label="' + esc(g.group) + '">';
      g.rows.forEach(function (row) {
        var st = evalAccountAddRow(row.type, accounts);
        if (st.omit) return;
        var dis = st.disabled ? ' disabled' : '';
        var tit = st.title ? ' title="' + esc(st.title) + '"' : '';
        html +=
          '<option value="' +
          esc(row.type) +
          '"' +
          dis +
          tit +
          '>' +
          esc(row.label) +
          '</option>';
      });
      html += '</optgroup>';
    });
    return html;
  }

  global.REGULATORY_REF = {
    REVIEW_STAMP: REVIEW_STAMP,
    FILE_NOTE:
      '법규 요약은 regulatory-reference.js 한 파일에 모았습니다. 개정 시 이 파일과 REVIEW_STAMP를 우선 갱신하세요.',
    FUND_RISK_GRADE_LABELS: FUND_RISK_GRADE_LABELS,
    FUND_RISK_GRADE_REF_RR: FUND_RISK_GRADE_REF_RR,
    DEFAULT_OPTION_GRADE_REF_RR: DEFAULT_OPTION_GRADE_REF_RR,
    APP_NAV_TABS: APP_NAV_TABS,
    JOB_TYPE_OPTIONS: JOB_TYPE_OPTIONS,
    jobTypeScenarioHintLabel: jobTypeScenarioHintLabel,
    JOB_SCENARIO_PRESETS: JOB_SCENARIO_PRESETS,
    JOB_SCENARIO_PRESET_BUTTONS: JOB_SCENARIO_PRESET_BUTTONS,
    AI_FOCUS_OPTIONS: AI_FOCUS_OPTIONS,
    ACCOUNT_ADD_GROUPS: ACCOUNT_ADD_GROUPS,
    ISA_TYPES: ISA_TYPES,
    evalAccountAddRow: evalAccountAddRow,
    buildJobAcctSuggestList: buildJobAcctSuggestList,
    htmlReferenceHub: htmlReferenceHub,
    buildNewAcctSelectHtml: buildNewAcctSelectHtml,
    buildAiFocusSelectHtml: buildAiFocusSelectHtml,
    buildAIRegulatoryBlock: buildAIRegulatoryBlock,
    htmlDefaultOptionBlock: htmlDefaultOptionBlock,
    buildJobAcctGuideHtml: buildJobAcctGuideHtml,
  };
})(typeof window !== 'undefined' ? window : this);

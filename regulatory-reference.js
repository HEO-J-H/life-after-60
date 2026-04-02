/**
 * regulatory-reference.js — 세법·연금·공제 요약 (도구 안내용, 법률 자문 아님)
 * 수정 시: REVIEW_STAMP 갱신 + law.go.kr·국세청·금융위·과학기술인공제회·고용노동부 병행 확인
 */
(function (global) {
  'use strict';

  var REVIEW_STAMP = '2026-04-02';

  var AS_OF_NOTE =
    '<span style="color:var(--t3);font-size:11px;">(안내 기준: <b>' +
    REVIEW_STAMP +
    '</b> 시점 법령·고시 <b>일반 요지</b> — 개정·해석·개별 사정에 따라 달라질 수 있음)</span>';

  function buildAIRegulatoryBlock(jobType) {
    var jtK = {
      employee: '직장인(급여소득)',
      researcher: '연구원·R&D(과학기술인공제·퇴직연금 등 병행 가능)',
      civil: '공무원·교직·군인 등 공적연금 병행',
      self: '자영업·프리랜서(종합소득·노란우산공제 등)',
      retired: '은퇴·기타소득 중심',
    };
    var jtLabel = jtK[jobType] || jobType || '미지정';
    return (
      '[법령·제도 요약 — ' +
      REVIEW_STAMP +
      ' 검토, 일반 안내]\n' +
      '직업군(기본정보): ' +
      jtLabel +
      '\n' +
      '· 연금저축·적립IRP: 납입액 소득공제(소득세법·조세특례제한법, 연간 한도·연금계좌 합산 납입 상한 등)\n' +
      '· 과학기술인공제회 퇴직연금: 회원(개인)부담금 등 연금적 납입의 세제는 소득세법 등 및 공제회 안내\n' +
      '· 퇴직IRP·DC: 퇴직급여 이연·디폴트옵션·위험등급별 자산배분은 근로자퇴직급여 보장법령·금융위 고시·약관\n' +
      '· ISA: 조특법 금융투자소득 비과세·분리과세·의무가입기간·금융소득 종합과세 관계\n' +
      '· 노란우산공제: 조특법상 사업자 등 납입 소득공제(종합소득금액 구간별 공제 한도 차등, 연도별 개정)\n' +
      '답변 시 계좌 유형과 연결하고, 확정 세액·법률 자문이 아님을 명시. 홈택스·국세청·가입 기관 최종 확인.'
    );
  }

  function htmlDefaultOptionBlock() {
    return (
      '<p style="margin:0 0 8px 0;line-height:1.65;">' +
      '<b>디폴트옵션</b>(DC형·IRP 등): 가입자가 운용지시를 하지 않거나 「디폴트옵션」을 택한 경우, ' +
      '<b>원리금보장형</b>·<b>실적배당형(비보장)</b> 등으로 자동·단계적으로 배정되는 제도입니다. ' +
      '근로자퇴직급여 보장법령·고시와 금융회사 약관을 따릅니다. ' +
      AS_OF_NOTE +
      '</p>' +
      '<ul style="margin:0 0 0 1.1em;padding:0;line-height:1.65;">' +
      '<li><b>위험등급·단계</b>: 상품별로 <b>초저위험·저·중·고위험 등 4단계</b>로 안내하거나, ' +
      '금융사가 <b>1등급~5등급</b> 식으로 표기하는 경우가 있습니다. 등급이 높을수록 일반적으로 위험자산 비중이 커질 수 있으나 ' +
      '<b>투자설명서·약관</b>의 정의를 따릅니다.</li>' +
      '<li><b>자산배분 규율</b>: 퇴직연금·IRP에서 위험·안전자산 비중 한도 등은 관련 법령·금융위 고시·약관을 따릅니다.</li>' +
      '<li><b>본 시뮬</b>은 개별 디폴트옵션 상품을 구분하지 않습니다. 계좌 수익률로 가정을 반영하세요.</li>' +
      '</ul>'
    );
  }

  function buildJobAcctGuideHtml(jobType) {
    var blocks = {
      employee:
        '<b>직장인(급여소득)</b> ' +
        AS_OF_NOTE +
        '<ul style="margin:6px 0 0 1.1em;padding:0;line-height:1.65;">' +
        '<li><b>두기 좋은 계좌</b>: ISA, 연금저축, 적립IRP, 퇴직 시 <b>퇴직IRP</b>, 직장 <b>DC/DB 퇴직연금</b>(디폴트옵션·위험등급은 약관).</li>' +
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
        '<li><b>그 외</b>: ISA·연금저축·적립IRP·퇴직IRP — 일반 직장인과 병행 검토. 직장 DC는 디폴트옵션·등급은 약관 확인.</li>' +
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

  global.REGULATORY_REF = {
    REVIEW_STAMP: REVIEW_STAMP,
    FILE_NOTE:
      '법규 요약은 regulatory-reference.js 한 파일에 모았습니다. 개정 시 이 파일과 REVIEW_STAMP를 우선 갱신하세요.',
    buildAIRegulatoryBlock: buildAIRegulatoryBlock,
    htmlDefaultOptionBlock: htmlDefaultOptionBlock,
    buildJobAcctGuideHtml: buildJobAcctGuideHtml,
  };
})(typeof window !== 'undefined' ? window : this);

/**
 * quickstart.js — ⚡ 빠른 시작 (6문항): 입력이 너무 많다는 피드백에 따라, 누구나 아는 것만 묻고 나머지는 기본값(가정)으로 바로 계산.
 *  - 기존 입력란에 값을 넣고 그 입력란의 이벤트를 그대로 발생시킴 → 계산식·시뮬 로직은 전혀 바꾸지 않음
 *  - 결과 화면 위에 '계산에 쓴 가정'을 보여 줘 사용자가 무엇을 가정했는지 알고 고칠 수 있게 함
 *  - 처음 방문(저장된 입력 없음)이면 자동으로 열림, 헤더 '⚡ 빠른 시작' 버튼으로 언제든 다시
 */
(function (global) {
  'use strict';

  var SEEN_KEY = 'retireSim_qs_seen';
  var SAVE_KEY = 'retireSim_v6r';
  var answers = {};
  var step = 0;

  function $(id) { return document.getElementById(id); }
  function num(v) { var n = parseFloat(String(v).replace(/[^\d.]/g, '')); return isNaN(n) ? null : n; }
  function won(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }
  function man(n) {  // 2억 5,000만원 처럼 읽기 쉬운 한국식 표기
    var m = Math.round(n / 10000), eok = Math.floor(m / 10000), rest = m % 10000;
    if (!eok) return m.toLocaleString('ko-KR') + '만원';
    return eok + '억' + (rest ? ' ' + rest.toLocaleString('ko-KR') + '만원' : '원');
  }
  function setField(id, value) {
    var el = $(id);
    if (!el) return;
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function cur(id) { var el = $(id); return el ? el.value : ''; }

  var THIS_YEAR = new Date().getFullYear();
  var STEPS = [
    {
      key: 'birthYear', q: '몇 년생이세요?', hint: '나이 계산에만 써요. 정보는 이 브라우저 밖으로 나가지 않아요.',
      input: { type: 'number', unit: '년생', placeholder: '예: 1975', def: function () { return (cur('birthDate') || '1980').slice(0, 4); } },
      chips: [1962, 1965, 1968, 1970, 1973, 1975, 1980].map(function (y) { return { label: y + '년', value: y }; }),
      valid: function (v) { return v >= THIS_YEAR - 90 && v <= THIS_YEAR - 20; }, err: '20세~90세에 해당하는 연도를 입력해 주세요.'
    },
    {
      key: 'retireAge', q: '몇 살에 은퇴하고 싶으세요?', hint: '일을 그만두고 모아둔 돈·연금으로 생활을 시작하는 나이예요.',
      input: { type: 'number', unit: '세', placeholder: '예: 60', def: function () { return cur('retireAge') || 65; } },
      chips: [55, 58, 60, 62, 65, 70].map(function (a) { return { label: a + '세', value: a }; }),
      valid: function (v) { return v >= 45 && v <= 75 && v > THIS_YEAR - (answers.birthYear || 1980); },
      err: '현재 나이보다 많고 45~75세 사이로 입력해 주세요.'
    },
    {
      key: 'salary', q: '지금 연봉(세전)은 얼마인가요?', hint: '대략이면 충분해요. 이미 은퇴했거나 소득이 없으면 "소득 없음".',
      input: { type: 'number', unit: '만원/년', placeholder: '예: 5000', def: function () { return Math.round((num(cur('salary')) || 50000000) / 10000); } },
      chips: [{ label: '소득 없음', value: 0 }, { label: '3,000만', value: 3000 }, { label: '5,000만', value: 5000 },
        { label: '7,000만', value: 7000 }, { label: '1억', value: 10000 }],
      valid: function (v) { return v >= 0 && v <= 100000; }, err: '0 ~ 10억 사이로 입력해 주세요.'
    },
    {
      key: 'rExp', q: '은퇴 후 한 달 생활비는 얼마면 될까요?', hint: '지금 생활비를 기준으로 생각해 보세요. (세금·건강보험료는 별도로 계산돼요)',
      input: { type: 'number', unit: '만원/월', placeholder: '예: 250', def: function () { return Math.round((num(cur('rExp')) || 1800000) / 10000); } },
      chips: [150, 200, 250, 300, 350, 400, 500].map(function (m) { return { label: m + '만', value: m }; }),
      valid: function (v) { return v >= 50 && v <= 3000; }, err: '50만 ~ 3,000만원 사이로 입력해 주세요.'
    },
    {
      key: 'assets', q: '지금까지 모아둔 노후자금은 얼마인가요?', hint: '연금저축·IRP·ISA·예금·주식 등을 합친 대략의 금액 (집은 빼고요).',
      multi: [
        { key: 'assets', label: '모아둔 금액', unit: '만원', placeholder: '예: 10000', def: '' },
        { key: 'monthly', label: '앞으로 매달 더 저축', unit: '만원/월', placeholder: '예: 50', def: '' }
      ],
      choice: { key: 'where', label: '주로 어디에 모으셨나요?', options: [
        { label: '연금저축·IRP', value: 'PENSION_FUND', rr: 5 },
        { label: 'ISA', value: 'ISA_BRK', rr: 5 },
        { label: '예금·적금', value: 'DEPOSIT', rr: 3 },
        { label: '주식·펀드', value: 'STOCKS', rr: 6 },
        { label: '잘 모르겠어요', value: 'GENERAL', rr: 4 }
      ] },
      skipLabel: '지금 입력된 계좌 그대로 쓰기'
    },
    {
      key: 'np', q: '예상 국민연금(월)을 아시나요?', hint: '국민연금공단 홈페이지·앱 "내 연금 알아보기"에서 확인할 수 있어요. 모르면 건너뛰세요.',
      input: { type: 'number', unit: '만원/월', placeholder: '예: 120', def: function () { return Math.round((num(cur('npBase')) || 1200000) / 10000); } },
      chips: [60, 80, 100, 120, 150].map(function (m) { return { label: m + '만', value: m }; }),
      valid: function (v) { return v >= 0 && v <= 500; }, err: '0 ~ 500만원 사이로 입력해 주세요.',
      skipLabel: '모르겠어요 (지금 값 그대로)'
    }
  ];

  // ───────────── UI ─────────────
  function build() {
    if ($('qs-overlay')) return;
    var o = document.createElement('div');
    o.id = 'qs-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-labelledby', 'qs-q');
    o.innerHTML =
      '<div class="qs-box"><div class="qs-top"><span class="qs-badge">⚡ 빠른 시작</span>' +
      '<span class="qs-prog" id="qs-prog"></span><button type="button" class="qs-x" id="qs-close" aria-label="닫기">✕</button></div>' +
      '<div class="qs-bar"><i id="qs-bar"></i></div>' +
      '<h2 id="qs-q" class="qs-q"></h2><p class="qs-hint" id="qs-hint"></p>' +
      '<div id="qs-body"></div><p class="qs-err" id="qs-err" role="alert"></p>' +
      '<div class="qs-nav"><button type="button" class="qs-btn qs-ghost" id="qs-prev">← 이전</button>' +
      '<button type="button" class="qs-btn qs-link" id="qs-skip">건너뛰기</button>' +
      '<button type="button" class="qs-btn qs-primary" id="qs-next">다음 →</button></div>' +
      '<p class="qs-foot">입력하지 않은 항목은 기본값으로 계산하고, 결과 위에 사용한 가정을 보여드려요. 자세한 항목은 언제든 각 탭에서 고칠 수 있어요.</p></div>';
    document.body.appendChild(o);
    $('qs-close').onclick = close;
    $('qs-prev').onclick = function () { if (step > 0) { step--; render(); } };
    $('qs-skip').onclick = function () { delete answers[STEPS[step].key]; next(true); };
    $('qs-next').onclick = function () { next(false); };
    o.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); next(false); }
    });
  }

  function render() {
    var s = STEPS[step];
    $('qs-prog').textContent = (step + 1) + ' / ' + STEPS.length;
    $('qs-bar').style.width = Math.round((step / STEPS.length) * 100) + '%';
    $('qs-q').textContent = s.q;
    $('qs-hint').textContent = s.hint || '';
    $('qs-err').textContent = '';
    $('qs-prev').style.visibility = step ? 'visible' : 'hidden';
    $('qs-skip').textContent = s.skipLabel || '건너뛰기 (기본값)';
    $('qs-next').textContent = step === STEPS.length - 1 ? '✔ 계산하기' : '다음 →';
    var b = $('qs-body');
    b.innerHTML = '';
    if (s.input) {
      var wrap = document.createElement('div');
      wrap.className = 'qs-inwrap';
      var inp = document.createElement('input');
      inp.className = 'qs-in'; inp.id = 'qs-in'; inp.type = 'number'; inp.inputMode = 'numeric';
      inp.placeholder = s.input.placeholder;
      inp.value = answers[s.key] != null ? answers[s.key] : s.input.def();
      inp.setAttribute('aria-label', s.q);
      wrap.appendChild(inp);
      var u = document.createElement('span'); u.className = 'qs-unit'; u.textContent = s.input.unit; wrap.appendChild(u);
      b.appendChild(wrap);
      var chips = document.createElement('div'); chips.className = 'qs-chips';
      (s.chips || []).forEach(function (c) {
        var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'qs-chip'; btn.textContent = c.label;
        btn.onclick = function () { inp.value = c.value; next(false); };
        chips.appendChild(btn);
      });
      b.appendChild(chips);
      setTimeout(function () { if (inp.isConnected) { inp.focus(); inp.select(); } }, 30);
    }
    if (s.multi) {
      s.multi.forEach(function (m, i) {
        var lab = document.createElement('label'); lab.className = 'qs-lab'; lab.textContent = m.label; lab.htmlFor = 'qs-m' + i;
        var wrap = document.createElement('div'); wrap.className = 'qs-inwrap';
        var inp = document.createElement('input'); inp.className = 'qs-in'; inp.id = 'qs-m' + i; inp.type = 'number';
        inp.inputMode = 'numeric'; inp.placeholder = m.placeholder;
        inp.value = answers[m.key] != null ? answers[m.key] : m.def;
        var u = document.createElement('span'); u.className = 'qs-unit'; u.textContent = m.unit;
        wrap.appendChild(inp); wrap.appendChild(u); b.appendChild(lab); b.appendChild(wrap);
      });
      var cl = document.createElement('div'); cl.className = 'qs-lab'; cl.textContent = s.choice.label; b.appendChild(cl);
      var chips2 = document.createElement('div'); chips2.className = 'qs-chips'; chips2.setAttribute('role', 'radiogroup');
      s.choice.options.forEach(function (c) {
        var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'qs-chip'; btn.textContent = c.label;
        btn.setAttribute('role', 'radio');
        var on = (answers.where || 'GENERAL') === c.value;
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
        if (on) btn.classList.add('on');
        btn.onclick = function () {
          answers.where = c.value;
          Array.prototype.forEach.call(chips2.children, function (x) { x.classList.remove('on'); x.setAttribute('aria-checked', 'false'); });
          btn.classList.add('on'); btn.setAttribute('aria-checked', 'true');
        };
        chips2.appendChild(btn);
      });
      b.appendChild(chips2);
      setTimeout(function () { var el = $('qs-m0'); if (el) el.focus(); }, 30);  // 빠르게 넘기면 이미 사라졌을 수 있음
    }
  }

  function next(skipped) {
    var s = STEPS[step];
    if (!skipped) {
      if (s.input) {
        var v = num($('qs-in').value);
        if (v == null || (s.valid && !s.valid(v))) { $('qs-err').textContent = s.err || '값을 확인해 주세요.'; return; }
        answers[s.key] = v;
      }
      if (s.multi) {
        var a = num($('qs-m0').value), m = num($('qs-m1').value);
        if (a == null && m == null) { delete answers.assets; delete answers.monthly; }
        else { answers.assets = a || 0; answers.monthly = m || 0; answers.where = answers.where || 'GENERAL'; }
      }
    }
    if (step < STEPS.length - 1) { step++; render(); return; }
    apply();
  }

  // ───────────── 적용 (기존 입력란에 값 → 기존 이벤트 → 기존 runSim) ─────────────
  function apply() {
    var used = [];
    if (answers.birthYear) {
      var md = (cur('birthDate') || '1980-01-01').slice(4) || '-01-01';
      setField('birthDate', answers.birthYear + md);
      used.push('생년 ' + answers.birthYear + '년');
    }
    if (answers.retireAge) { setField('retireAge', answers.retireAge); used.push('은퇴 ' + answers.retireAge + '세'); }
    if (answers.salary != null) { setField('salary', answers.salary * 10000); used.push(answers.salary ? '연봉 ' + man(answers.salary * 10000) : '소득 없음'); }
    if (answers.rExp) { setField('rExp', answers.rExp * 10000); used.push('은퇴 후 생활비 월 ' + man(answers.rExp * 10000)); }
    if (answers.np != null) { setField('npBase', answers.np * 10000); used.push('국민연금 월 ' + man(answers.np * 10000)); }
    /* global accounts */  // 본 앱이 최상위 let 으로 선언 → window 속성이 아니라 이름으로 직접 접근
    if (answers.assets != null && typeof accounts !== 'undefined' && Array.isArray(accounts) && typeof global.addAcctD === 'function') {
      // 앱이 처음 띄우는 견본 계좌 그대로면 묻지 않고 교체, 사용자가 손댄 계좌가 있으면 확인 (앱은 로드 즉시 자동 저장하므로 저장 여부로는 판단 불가)
      var sample = accounts.length === 4 && accounts.every(function (a) {
        return ({ IRP_RETIRE: '2660000/0', PENSION_FUND: '10000000/400000', ISA_BRK: '15000000/300000',
                  IRP_ACCUM: '5000000/200000' })[a.type] === a.balance + '/' + a.monthlyContrib;
      });
      var ok = sample || confirm('지금 입력된 계좌들을 쉬게(비활성) 하고, 빠른 시작에서 입력한 금액으로 계좌 1개를 만들까요?\n(기존 계좌는 지워지지 않고 [계좌설정] 탭에서 다시 켤 수 있어요)');
      if (ok) {
        accounts.forEach(function (acc) { acc.active = false; });
        var opt = STEPS[4].choice.options.filter(function (o) { return o.value === answers.where; })[0] || STEPS[4].choice.options[4];
        global.addAcctD(opt.value, answers.assets * 10000, answers.monthly * 10000, opt.rr, true);
        if (typeof global.renderAccts === 'function') global.renderAccts();
        used.push(opt.label + ' ' + man(answers.assets * 10000) + ' + 매달 ' + man(answers.monthly * 10000) +
                  ' (가정 수익률 연 ' + opt.rr + '%)');
      } else {
        used.push('모아둔 금액은 반영 안 함 (기존 계좌 유지)');
      }
    }
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* 저장 불가 환경 */ }
    close();
    if (typeof global.runSim === 'function') {
      global.runSim();
      showAssumptions(used);
    }
  }

  function showAssumptions(used) {
    var host = $('tab-sim');
    if (!host) return;
    var old = $('qs-assume'); if (old) old.remove();
    var box = document.createElement('div');
    box.id = 'qs-assume';
    box.className = 'qs-assume';
    var rows = [
      ['입력하신 값', used.length ? used.join(' · ') : '없음 (모두 기본값)'],
      ['물가상승률', cur('inf') + '%/년'], ['연봉 상승률', cur('salGrowth') + '%/년'],
      ['기대수명', cur('lifeExp') + '세'], ['국민연금 수령 시작', cur('npAge') + '세'],
      ['국민연금(월, 현재가치)', won(num(cur('npBase')) || 0)]
    ];
    box.innerHTML = '<div class="qs-assume-h">⚡ 빠른 시작 결과 — 계산에 쓴 가정</div><dl>' +
      rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>' +
      '<p>세금·건강보험료·연금 수령 방식 등 나머지는 기본 설정값으로 계산했어요. 더 정확히 하려면 [기본정보]·[계좌설정] 탭에서 고친 뒤 ' +
      '<b>▶ 시뮬레이션</b>을 다시 누르세요. <button type="button" class="qs-btn qs-link" id="qs-again">⚡ 빠른 시작 다시 하기</button> ' +
      '<button type="button" class="qs-btn qs-link" id="qs-hide">닫기</button></p>' +
      '<p class="qs-note">도구 안내용 시뮬레이션이며 투자·세무 자문이 아닙니다.</p>';
    host.insertBefore(box, host.firstChild);
    $('qs-again').onclick = open;
    $('qs-hide').onclick = function () { box.remove(); };
  }

  function open() {
    build();
    answers = {};
    step = 0;
    $('qs-overlay').classList.add('on');
    document.body.classList.add('qs-lock');
    render();
  }

  function close() {
    var o = $('qs-overlay');
    if (o) o.classList.remove('on');
    document.body.classList.remove('qs-lock');
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* 저장 불가 환경 */ }
  }

  function addHeaderButton() {
    var bar = document.querySelector('.hdr-r');
    if (!bar || $('qs-open-btn')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'qs-open-btn'; b.className = 'btn qs-open'; b.textContent = '⚡ 빠른 시작';
    b.title = '6가지만 답하면 바로 계산해요';
    b.onclick = open;
    bar.insertBefore(b, bar.firstChild);
  }

  function init() {
    addHeaderButton();
    var first = false;
    try { first = !localStorage.getItem(SAVE_KEY) && !localStorage.getItem(SEEN_KEY); } catch (e) { first = false; }
    if (first) setTimeout(open, 600);
  }

  global.QuickStart = { open: open, close: close, _steps: STEPS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);

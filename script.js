(function () {
    'use strict';
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const FINE = matchMedia('(pointer: fine)').matches;
    const MOTION = !REDUCED && !!(window.gsap && window.ScrollTrigger);
    if (MOTION) {
        gsap.registerPlugin(ScrollTrigger);
        document.documentElement.classList.add('motion');
        ScrollTrigger.config({ ignoreMobileResize: true });
    }
    const AR = '<svg class="ar" width="16" height="10" viewBox="0 0 16 10" aria-hidden="true"><path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor"/></svg>';
    const CHK = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8.5l4 4L14 3.5" fill="none" stroke="#7ADFE8" stroke-width="1.5"/></svg>';
    const PLUS = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" fill="none" stroke="#8E7BFF" stroke-width="1.2"/></svg>';

    /* ---------- toast ---------- */
    let toastT;
    function toast(msg) {
        const t = $('#toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('on');
        clearTimeout(toastT);
        toastT = setTimeout(() => t.classList.remove('on'), 2200);
    }

    /* ---------- nav / menu ---------- */
    const nav = $('#nav');
    if (nav) {
        addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
    }
    const menuBtn = $('#menuBtn'), menu = $('#menu');
    function setMenu(open) {
        if (!menu || !menuBtn) return;
        menu.classList.toggle('on', open);
        menuBtn.setAttribute('aria-expanded', open);
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.setAttribute('aria-hidden', !open);
    }
    if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('on')));
    if (menu) $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    const yrEl = $('#yr');
    if (yrEl) yrEl.textContent = new Date().getFullYear();
    $$('[data-social],[data-legal]').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        toast(a.dataset.social ? 'OPENS WITH THE REAL LAUNCH' : 'PAPERWORK COMES BEFORE LIFTOFF');
    }));

    /* ---------- intro + hero ---------- */
    const heroSec = $('#hero');
    const ds = $('#digitalSide');
    if (ds) {
        ds.innerHTML = [...ds.textContent].map(c => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join('');
    }
    function heroIn() {
        const tl = gsap.timeline();
        tl.to('#hero .hero-title .mline', { yPercent: 0, duration: 1.25, stagger: .13, ease: 'power3.out' }, 0)
            .to('.hero .hi', { opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out' }, .45)
            .to('.hero .h-label', { opacity: 1, duration: .9, stagger: .07, ease: 'power2.out' }, .7);
        return tl;
    }
    function introSeq() {
        const ov = $('#intro');
        if (!ov) return;
        if (!MOTION) { ov.remove(); return; }
        gsap.set('#hero .hero-title .mline', { yPercent: 112 });
        gsap.set(['.hero .hi', '.hero .h-label'], { opacity: 0, y: 24 });
        gsap.set('.h-label', { y: 0 });
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to('#intro .i-logo .mline', { yPercent: 0, duration: 1 }, .2)
            .to('#intro .i-tag .mline', { yPercent: 0, duration: .8 }, .75)
            .to('#intro .i-welcome .mline', { yPercent: 0, duration: .9 }, 1.4)
            .to('#intro .i-desc .mline', { yPercent: 0, duration: .9 }, 1.95)
            .add('out', 4.1)
            .to('#intro .i-welcome .mline', { yPercent: -130, letterSpacing: '.16em', duration: 1.05, ease: 'power2.in' }, 'out')
            .to(['#intro .i-logo .mline', '#intro .i-tag .mline'], { yPercent: -130, duration: .7, ease: 'power2.in', stagger: .07 }, 'out')
            .to('#intro .i-desc .mline', { opacity: 0, y: -22, duration: .6, ease: 'power2.in' }, 'out')
            .to('#atmoHero', { opacity: 1, duration: 2.2, ease: 'power1.out' }, 'out')
            .add(heroIn(), 'out+=.2')
            .set('#intro', { display: 'none' });
        let done = false;
        const skip = () => { if (!done) { done = true; tl.progress(1, false); } };
        const evs = [['wheel', skip], ['touchstart', skip], ['keydown', skip], ['pointerdown', skip]];
        evs.forEach(([e, f]) => addEventListener(e, f, { passive: true }));
        tl.eventCallback('onComplete', () => evs.forEach(([e, f]) => removeEventListener(e, f)));
    }
    introSeq();

    /* ---------- hero cursor FX ---------- */
    if (MOTION && FINE && heroSec) {
        const chs = $$('#digitalSide .ch').map(el => ({ el, y: 0, r: 0, cx: 0, cy: 0 }));
        let mx = -9999, my = -9999, active = false, frame = 0;
        const measure = () => chs.forEach(o => { const r = o.el.getBoundingClientRect(); o.cx = r.left + r.width / 2; o.cy = r.top + r.height / 2; });
        heroSec.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; active = true; }, { passive: true });
        heroSec.addEventListener('pointerleave', () => { active = false; });
        gsap.ticker.add(() => {
            if (scrollY > innerHeight) return;
            if ((frame++ % 24) === 0) measure();
            chs.forEach(o => {
                const dx = o.cx - mx, dy = o.cy - my, d = Math.hypot(dx, dy);
                const f = active ? Math.max(0, 1 - d / 260) : 0;
                o.y += ((-18 * f * f) - o.y) * .14; o.r += (((dx > 0 ? 1 : -1) * 4.5 * f * f) - o.r) * .14;
                o.el.style.transform = `translateY(${o.y.toFixed(2)}px) rotate(${o.r.toFixed(2)}deg)`;
            });
        });
        $$('.h-label').forEach(l => {
            const d = parseFloat(l.dataset.depth || '.5');
            const qx = gsap.quickTo(l, 'x', { duration: .9, ease: 'power3' }), qy = gsap.quickTo(l, 'y', { duration: .9, ease: 'power3' });
            heroSec.addEventListener('pointermove', e => { qx((e.clientX / innerWidth - .5) * 44 * d); qy((e.clientY / innerHeight - .5) * 34 * d); }, { passive: true });
        });
    }

    /* ---------- generic reveals ---------- */
    if (MOTION) {
        gsap.set('.msk .mline', { yPercent: 115 });
        gsap.set('.rv', { opacity: 0, y: 26 });
        $$('.rl').forEach(g => {
            const ls = $$('.mline', g);
            if (!ls.length) return;
            const sec = g.closest('[data-manual]');
            if (sec) return; // manual sections handle their own
            gsap.to(ls, {
                yPercent: 0, duration: 1.1, ease: 'power3.out', stagger: .1,
                scrollTrigger: { trigger: g, start: 'top 85%' }
            });
        });
        $$('.rv').forEach(el => {
            if (el.closest('[data-manual]')) return;
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });
        $$('[data-atmo]').forEach(sec => {
            if (sec.id === 'eco') return;
            gsap.to($('.atmo', sec), {
                opacity: 1, ease: 'none',
                scrollTrigger: { trigger: sec, start: 'top 90%', end: 'top 35%', scrub: true }
            });
        });
    }

    /* ---------- ecosystem ---------- */
    const ECO_NODES = [
        { id: 'biz', x: 50, y: 50, label: 'YOUR BUSINESS', center: true },
        { id: 'brand', x: 24, y: 19, label: 'BRAND' },
        { id: 'content', x: 76, y: 19, label: 'CONTENT' },
        { id: 'website', x: 86, y: 50, label: 'WEBSITE' },
        { id: 'search', x: 76, y: 81, label: 'SEARCH' },
        { id: 'social', x: 24, y: 81, label: 'SOCIAL' },
        { id: 'growth', x: 12, y: 50, label: 'GROWTH', acc: 'c' },
        { id: 'systems', x: 50, y: 8, label: 'SYSTEMS' },
        { id: 'ai', x: 50, y: 92, label: 'AI', acc: 'p' }
    ];
    const ECO_LINKS = [
        ['biz', 'brand'], ['biz', 'content'], ['biz', 'website'], ['biz', 'search'], ['biz', 'social'], ['biz', 'growth'], ['biz', 'systems'], ['biz', 'ai'],
        ['brand', 'content'], ['content', 'website'], ['website', 'search'], ['search', 'social'], ['social', 'brand'],
        ['growth', 'search'], ['growth', 'social'],
        ['systems', 'brand'], ['systems', 'content'],
        ['ai', 'systems'], ['ai', 'growth'], ['ai', 'search']
    ];
    (function buildEco() {
        const stage = $('#ecoStage'), svg = $('#ecoSvg'), NS = 'http://www.w3.org/2000/svg';
        if (!stage || !svg) return;
        const pos = {}; ECO_NODES.forEach(n => pos[n.id] = n);
        ECO_LINKS.forEach((lk, i) => {
            const l = document.createElementNS(NS, 'line');
            l.setAttribute('pathLength', '1'); l.setAttribute('class', 'eco-line');
            if (i % 3 === 0) l.classList.add('tc'); else if (i % 3 === 1) l.classList.add('tp');
            l.setAttribute('x1', pos[lk[0]].x); l.setAttribute('y1', pos[lk[0]].y);
            l.setAttribute('x2', pos[lk[1]].x); l.setAttribute('y2', pos[lk[1]].y);
            svg.appendChild(l);
        });
        ECO_NODES.forEach(n => {
            const d = document.createElement('div');
            d.className = 'eco-node' + (n.center ? ' eco-center' : '') + (n.acc ? ' acc-' + n.acc : '');
            d.id = 'eco-n-' + n.id;
            d.style.left = n.x + '%'; d.style.top = n.y + '%';
            d.innerHTML = '<i></i><b>' + n.label + '</b>';
            stage.appendChild(d);
        });
    })();
    if (MOTION && $('#ecoStage')) {
        const order = ['brand', 'content', 'website', 'search', 'social', 'growth', 'systems', 'ai'];
        const laterOf = (a, b) => (order.indexOf(a) > order.indexOf(b)) ? a : b;
        const linksFor = {}; order.forEach(id => linksFor[id] = []);
        const lineKey = lk => lk[0] + lk[1];
        const lineEls = {};
        $$('.eco-line').forEach((l, i) => lineEls[ECO_LINKS[i].join('')] = l);
        ECO_LINKS.forEach(lk => linksFor[laterOf(lk[0], lk[1])].push(lk));
        const caps = $$('.eco-cap');
        gsap.set('#ecoFinal p', { opacity: 0 });
        gsap.set(caps, { opacity: 0, y: 12 });
        const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: { trigger: '.eco-pin', start: 'top top', end: '+=300%', scrub: .6, pin: true, anticipatePin: 1 }
        });
        gsap.set('#eco-n-biz', { opacity: 0, scale: .82 });
        gsap.set('#eco .rl .mline', { yPercent: 115 });
        tl.to('#eco .rl .mline', { yPercent: 0, duration: 4 }, 0)
            .fromTo('.eco-stage', { scale: .96 }, { scale: 1, duration: 78, ease: 'none' }, 0)
            .to('#eco-n-biz', { opacity: 1, scale: 1, duration: 4 }, 1);
        const t0 = 8, step = 5.4;
        order.forEach((id, i) => {
            const t = t0 + i * step;
            tl.fromTo('#eco-n-' + id, { opacity: 0, scale: .82 }, { opacity: 1, scale: 1, duration: 2.4 }, t)
                .to(linksFor[id].map(lk => lineEls[lineKey(lk)]), { strokeDashoffset: 0, duration: 3, stagger: .5, ease: 'none' }, t + .5);
        });
        const capAt = [[2, 11], [12, 30], [31, 43], [44, 50], [51, 56]];
        caps.forEach((c, i) => {
            const [a, b] = capAt[i];
            tl.to(c, { opacity: 1, y: 0, duration: 2 }, a).to(c, { opacity: 0, y: -10, duration: 1.6 }, b);
        });
        tl.to('#eco-n-biz b', { opacity: 0, duration: 2 }, 56)
            .to('#ecoFinal .mline', { yPercent: 0, duration: 3.4, ease: 'power3.out' }, 56.5)
            .to('#ecoFinal p', { opacity: 1, duration: 2.5 }, 58.5)
            .to('.eco-line.tc', { stroke: 'rgba(122,223,232,.42)', duration: 6 }, 57)
            .to('.eco-line.tp', { stroke: 'rgba(142,123,255,.42)', duration: 6 }, 57)
            .to('.eco-line:not(.tc):not(.tp)', { stroke: 'rgba(236,236,241,.3)', duration: 6 }, 57)
            .to(order.map(id => '#eco-n-' + id), { opacity: .5, duration: 5 }, 58)
            .to('#atmoHero', { opacity: 1, duration: 6 }, 57)
            .to({}, { duration: 14 }, 64);
    }

    /* ---------- categories ---------- */
    (function () {
        const cats = $$('.cat'), wrap = $('#cats');
        if (!cats.length || !wrap) return;
        const setCat = c => {
            cats.forEach(x => {
                const on = x === c;
                x.classList.toggle('active', on);
                const h = $('.cat-head', x);
                if (h) h.setAttribute('aria-expanded', on);
            });
            wrap.classList.add('has-active');
        };
        cats.forEach(c => {
            c.addEventListener('mouseenter', () => { if (FINE) setCat(c); });
            const head = $('.cat-head', c);
            if (head) head.addEventListener('click', () => setCat(c));
        });
    })();

    /* ---------- questions ---------- */
    if (MOTION && $('#questions')) {
        $('#questions').classList.add('q-live');
        const pairs = $$('.q-pair'), fin = $('.q-final'), stage = $('#qStage');
        gsap.set([...pairs, fin], { opacity: 0 });
        const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: '.q-pin', start: 'top top', end: '+=430%', scrub: .5, pin: true, anticipatePin: 1 }
        });
        gsap.set('#questions .rl .mline', { yPercent: 115 });
        tl.to('#questions .q-head .mline', { yPercent: 0, duration: 4 }, 0);
        pairs.forEach((p, i) => {
            const t = 8 + i * 10;
            tl.set(p, { opacity: 1 }, t)
                .to($$('.mline', p), { yPercent: 0, duration: 2.4, stagger: .4 }, t)
                .fromTo($('.q-a', p), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 2 }, t + 2.2)
                .to($$('.mline', p), { yPercent: -112, duration: 2, stagger: .25, ease: 'power3.in' }, t + 6.6)
                .to($('.q-a', p), { opacity: 0, y: -16, duration: 1.5, ease: 'power2.in' }, t + 6.8)
                .set(p, { opacity: 0 }, t + 9.2);
        });
        const ft = 8 + pairs.length * 10;
        tl.set(fin, { opacity: 1 }, ft)
            .to($$('.mline', fin), { yPercent: 0, duration: 3.5, stagger: .4 }, ft)
            .to($('.q-a', fin), { opacity: 1, y: 0, duration: 2.5 }, ft + 2.4)
            .to({}, { duration: 9 }, ft + 4);
    }

    /* ---------- builder (diagnostic) ---------- */
    (function () {
        const stage = $('#builderStage');
        if (!stage) return;
        const TYPES = {
            'BUSINESS': 'A BUSINESS. Nice. Let\u2019s figure out the digital side.',
            'STARTUP': 'A STARTUP. Good. Let\u2019s figure out the digital side.',
            'BRAND': 'A BRAND. Let\u2019s give it somewhere to live.',
            'PRODUCT': 'A PRODUCT. Let\u2019s figure out the digital side.',
            'PERSONAL BRAND': 'A PERSONAL BRAND. Let\u2019s figure out the digital side.',
            'GROWING BUSINESS': 'A GROWING BUSINESS. Right on time.',
            'SOMETHING ELSE': 'SOMETHING ELSE. Usually the best ones. Let\u2019s figure out its digital side.'
        };
        const TYPE_KEYS = Object.keys(TYPES);
        const QS = [
            { key: 'website', q: 'DO YOU HAVE A WEBSITE?', opts: ['YES', 'NO'] },
            { key: 'find', q: 'CAN PEOPLE FIND YOU?', opts: ['YES', 'NOT REALLY', 'I DON\u2019T KNOW'] },
            { key: 'enq', q: 'ARE YOU GETTING ENQUIRIES?', opts: ['YES', 'SOMETIMES', 'NO'] }
        ];
        const S = { type: null, answers: {}, timer: null };
        const letter = i => String.fromCharCode(65 + i);
        function swap(html, cb) {
            clearTimeout(S.timer);
            const go = () => {
                stage.innerHTML = html; if (cb) cb();
                if (MOTION) gsap.fromTo(stage.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .65, stagger: .07, ease: 'power3.out' });
            };
            if (MOTION && stage.children.length) {
                gsap.to(stage.children, { opacity: 0, y: -18, duration: .3, stagger: .04, ease: 'power2.in', onComplete: go });
            } else go();
        }
        function stepType() {
            const rows = TYPE_KEYS.map((t, i) => `<button class="bopt" data-type="${t}"><span class="ix">${letter(i)}</span>${t}<span class="go">${AR}</span></button>`).join('');
            swap(`<div><p class="b-meta label"><span>QUESTION 01 / 04</span><span>PICK ONE</span></p>
      <p class="b-q">PICK WHAT'S CLOSEST.</p><div class="bopts">${rows}</div></div>`, () => {
                $$('.bopt', stage).forEach(b => b.addEventListener('click', () => { S.type = b.dataset.type; stepAck(); }));
            });
        }
        function stepAck() {
            swap(`<div><p class="ack-big">${TYPES[S.type].split('. ')[0]}.</p>
      <p class="ack-small">${TYPES[S.type].split('. ').slice(1).join('. ')}</p></div>`);
            S.timer = setTimeout(() => stepQ(0), 1500);
        }
        function stepQ(i) {
            const q = QS[i];
            const rows = q.opts.map((o, j) => `<button class="bopt" data-v="${o}"><span class="ix">${letter(j)}</span>${o}<span class="go">${AR}</span></button>`).join('');
            swap(`<div><p class="b-meta label"><span>QUESTION 0${i + 2} / 04</span><span>${S.type}</span></p>
      <p class="b-q">${q.q}</p><div class="bopts">${rows}</div></div>`, () => {
                $$('.bopt', stage).forEach(b => b.addEventListener('click', () => {
                    S.answers[q.key] = b.dataset.v;
                    i < QS.length - 1 ? stepQ(i + 1) : stepResult();
                }));
            });
        }
        function stepResult() {
            const a = S.answers;
            const have = [], could = [];
            if (a.website === 'YES') have.push('Website'); else could.push('Website', 'Credibility');
            if (a.find === 'YES') have.push('Search'); else could.push('Search', 'Content');
            if (a.enq === 'YES') have.push('Enquiries'); else could.push('Conversion', 'Follow-up');
            if ((S.type === 'BRAND' || S.type === 'PERSONAL BRAND') && !could.includes('Content')) could.push('Content');
            const uniqC = [...new Set(could)].slice(0, 3);
            let move, label, href;
            if (a.website !== 'YES') { move = 'BUILD YOUR FOUNDATION'; label = 'A site that answers, convinces and captures.'; href = '#work'; }
            else if (a.find !== 'YES') { move = 'BUILD YOUR VISIBILITY'; label = 'Be findable for the things you actually do.'; href = '#do'; }
            else if (a.enq !== 'YES') { move = 'BUILD YOUR PIPELINE'; label = 'Turn the attention you have into enquiries.'; href = '#do'; }
            else { move = 'SHARPEN THE WHOLE SYSTEM'; label = 'The base works. Time to compound it.'; href = '#library'; }
            const ctx = [S.type, a.website === 'YES' ? 'HAS WEBSITE' : 'NO WEBSITE',
            a.find === 'YES' ? 'FINDABLE' : (a.find === 'NOT REALLY' ? 'HARD TO FIND' : 'VISIBILITY UNKNOWN'),
            a.enq === 'YES' ? 'GETTING ENQUIRIES' : (a.enq === 'SOMETIMES' ? 'SPORADIC ENQUIRIES' : 'NO ENQUIRIES')].join(' · ');
            const haveHTML = have.length ? have.map(h => `<div class="res-item">${CHK}${h}</div>`).join('')
                : '<div class="res-item miss">Not much yet — that\u2019s fine. That\u2019s what we do.</div>';
            swap(`<div>
      <p class="label" style="margin-bottom:14px">( RESULT ) — <b>YOUR STARTING POINT</b></p>
      <p class="res-ctx">${ctx}</p>
      <div class="res-grid">
        <div class="res-col"><h4>YOU HAVE</h4>${haveHTML}</div>
        <div class="res-col"><h4>YOU COULD BUILD</h4>${uniqC.map(c => `<div class="res-item">${PLUS}${c}</div>`).join('')}</div>
      </div>
      <div class="res-move">
        <p class="label" style="margin-bottom:16px">YOUR NEXT MOVE</p>
        <a class="bopt" style="display:flex;border-top:1px solid var(--line);border-bottom:1px solid var(--line)" href="${href}">${move}<span class="go">${AR}</span></a>
        <div style="display:flex;gap:26px;margin-top:30px;flex-wrap:wrap">
          <button class="btn btn-solid" data-open-contact>START BUILDING ${AR}</button>
          <button class="tlink" id="bReset">← START OVER</button>
        </div>
      </div>
      <p class="res-note">Rule-based, not magic — a starting point, not a verdict. The real answer starts with a conversation about what you're building.</p>
    </div>`, () => {
                const rBtn = $('#bReset', stage);
                if (rBtn) rBtn.addEventListener('click', () => { S.type = null; S.answers = {}; stepType(); });
                bindContact($('[data-open-contact]', stage));
            });
        }
        stepType();
    })();

    /* ---------- work ---------- */
    const PROJECTS = [
        {
            id: 'kiln', num: '01', name: 'KILN & CO', tags: 'BRAND · WEB · GROWTH', sector: 'CERAMICS STUDIO', year: '2024', img: 'assets/kiln.jpg',
            what: 'A ceramics studio with a waitlist offline and silence online.',
            gap: 'Kiln & Co sold out every market they attended. Online, they were invisible — no store, no story, no way to buy. The work spoke, but only to people standing in front of it.',
            move: 'Stop treating the studio like a stall and start treating it like a brand. A name system, a photographic language, and an editorial storefront that sells the making, not just the object.',
            build: 'Identity and art direction. A fast, direct storefront. A content system built around the kiln — process, firings, failures included. Email as the main channel, not an afterthought.',
            stat: '3.2\u00D7', statL: 'more online enquiries in the first six months. Sold-out launches replaced market dependence, and the waitlist went digital.',
            next: 'A second product line and a small wholesale system, built on the same foundation.'
        },
        {
            id: 'meridian', num: '02', name: 'MERIDIAN FREIGHT', tags: 'WEB · SYSTEMS · AI', sector: 'LOGISTICS OPERATOR', year: '2024', img: 'assets/meridian.jpg',
            what: 'A freight operator answering two-day questions with two-day speed.',
            gap: 'Every quote lived in a spreadsheet and a phone call. It took two days to answer what a customer asked in two minutes — and the fastest operator was losing to whoever replied first.',
            move: 'Stop treating quoting as admin and build it as the product: a structured quoting system with a face customers can actually use.',
            build: 'A quoting engine with live rates. A customer portal for tracking and documents. Internal dashboards the team actually opens. AI-assisted triage for routine email requests.',
            stat: '48h \u2192 20min', statL: 'quote turnaround. The team stopped doing data entry and started moving freight.',
            next: 'Opening the quoting API to partner agents — the system was designed for it from day one.'
        },
        {
            id: 'driftline', num: '03', name: 'DRIFTLINE', tags: 'BRAND · CONTENT · WEB', sector: 'COASTAL RETREATS', year: '2023', img: 'assets/driftline.jpg',
            what: 'A retreat people loved, on a channel the retreat didn\u2019t own.',
            gap: 'Eighty percent of nights went through booking platforms that owned the customer, the data and the margin. The retreat had fans and no direct relationship with any of them.',
            move: 'Make the direct channel worth choosing. A brand worth remembering, photography worth staying for, and a real reason to book direct.',
            build: 'Full identity and voice. A place-based content system — seasons, tide tables, local guides. A direct booking flow with none of the usual friction.',
            stat: '61%', statL: 'of bookings now come direct. Marketing spend per booking fell by a third.',
            next: 'A membership for returning guests — the system to run it is already in place.'
        }
    ];
    (function () {
        const list = $('#workList');
        if (!list) return;
        list.innerHTML = PROJECTS.map(p => `<button class="wk-row" data-id="${p.id}" aria-label="Open case study: ${p.name}">
    <span class="wk-num">${p.num}</span><span class="wk-name">${p.name}</span>
    <span class="wk-side"><span class="wk-tags">${p.tags}</span>
    <span class="wk-view">VIEW CASE ${AR}</span></span></button>`).join('');

        const pv = $('#workPreview'), pvImg = $('img', pv);
        let on = false, px = 0, py = 0, tx = 0, ty = 0;
        if (MOTION && FINE && pv && pvImg) {
            $$('.wk-row', list).forEach(r => {
                r.addEventListener('mouseenter', () => {
                    const p = PROJECTS.find(x => x.id === r.dataset.id);
                    if (p) pvImg.src = p.img;
                    pv.classList.add('on'); on = true;
                });
                r.addEventListener('mouseleave', () => { pv.classList.remove('on'); on = false; });
            });
            addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
            gsap.ticker.add(() => {
                if (!on && Math.abs(tx - px) < .5) return;
                px += (tx - px) * .12; py += (ty - py) * .12;
                const rot = Math.max(-5, Math.min(5, (tx - px) * .08));
                pv.style.transform = `translate(${px + 28}px,${py - pv.offsetHeight / 2}px) rotate(${rot}deg)`;
            });
        }
        $$('.wk-row', list).forEach(r => r.addEventListener('click', () => openCase(r.dataset.id)));
    })();
    function openCase(id) {
        const i = PROJECTS.findIndex(p => p.id === id), p = PROJECTS[i];
        const cb = $('#caseBody');
        if (!cb) return;
        cb.innerHTML = `
    <div class="case-hero">
      <div class="case-kicker label"><span>${p.num} / 03</span><span><b>${p.name}</b></span><span>${p.sector}</span><span>${p.year}</span><span>${p.tags}</span></div>
      <h2 class="case-title">${p.name}</h2>
      <p class="case-what">${p.what}</p>
    </div>
    <div class="case-img wide"><img src="${p.img}" alt="${p.name} — project visual" loading="lazy"></div>
    <div class="case-body">
      <div class="beat"><h3>THE GAP</h3><p>${p.gap}</p></div>
      <div class="beat"><h3>THE MOVE</h3><p>${p.move}</p></div>
      <div class="beat"><h3>THE BUILD</h3><p>${p.build}</p></div>
    </div>
    <div class="case-img wide"><img src="${p.img}" alt="${p.name} — detail" loading="lazy"></div>
    <div class="case-body">
      <div class="beat"><h3>THE SHIFT</h3><div><p class="stat">${p.stat}</p><p class="stat-l">${p.statL}</p></div></div>
      <div class="beat"><h3>WHAT'S NEXT</h3><p>${p.next}</p></div>
    </div>
    <div class="case-foot">
      <button class="tlink" data-open-contact>START SOMETHING LIKE THIS ${AR}</button>
      <button class="btn btn-ghost" id="caseNext">NEXT PROJECT ${AR}</button>
    </div>`;
        openOvl('#caseOvl');
        const nextBtn = $('#caseNext');
        if (nextBtn) nextBtn.addEventListener('click', () => openCase(PROJECTS[(i + 1) % PROJECTS.length].id));
        bindContact(cb);
    }

    /* ---------- library ---------- */
    const ARTICLES = [
        {
            n: '01', cat: 'PRESENCE', time: '6 MIN', title: 'Why people don\u2019t find good businesses',
            body: ['Most businesses aren\u2019t invisible because they\u2019re bad. They\u2019re invisible because findability was never anyone\u2019s job.', 'Being found isn\u2019t one decision — it\u2019s a stack: words on your site that match what people actually type, pages that answer real questions, a profile that\u2019s consistent everywhere, and enough patience for search engines to believe you.', 'Good businesses fail this quietly. They describe themselves the way they think about themselves — internally, vaguely, proudly — instead of the way customers search.', 'The fix is unglamorous. Write down the ten things your best customer would type at 11pm. Make sure your site says them, plainly, on pages built for them. Then keep the promises those pages make. Visibility isn\u2019t marketing magic. It\u2019s maintenance.']
        },
        {
            n: '02', cat: 'BUILD', time: '5 MIN', title: 'Do you actually need a website?',
            body: ['Sometimes no. If you\u2019re testing an idea, a sharp profile page and a payment link will teach you more in a week than a three-month website project.', 'But you need a website the moment any of these are true: people search for what you do, you need to explain something complex once instead of a hundred times, or other businesses check you out before working with you.', 'A website\u2019s job is not to exist. Its job is to answer, convince, or capture — ideally in that order, in about ten seconds.', 'If your current site does none of those, you don\u2019t need a redesign. You need a decision about what it\u2019s for.']
        },
        {
            n: '03', cat: 'GROW', time: '4 MIN', title: 'What makes people trust a brand?',
            body: ['Not the logo. Trust is built from boring, checkable things.', 'Specificity: vague claims sound like everyone; precise ones sound like experience. \u201CFast delivery\u201D is noise. \u201CShips in 48 hours, tracked\u201D is a promise.', 'Evidence: photos of real work, names of real clients, numbers you can stand behind. Consistency: the same voice on the invoice, the caption and the support reply — trust collapses where the personality changes.', 'And time, honestly. Brands are compounds, not sparks. If you want to be trusted faster, say something precise, show the proof, and repeat it longer than feels necessary.']
        },
        {
            n: '04', cat: 'AI', time: '7 MIN', title: 'Where AI actually helps a business',
            body: ['Strip away the demos and AI currently earns its keep in four places.', 'Drafting: first versions of emails, descriptions and posts — written by a machine, finished by you. Research: summarising documents and turning messy piles of information into a starting brief. Support: answering the twenty questions you answer every week and routing the rest to a human. Ops glue: reading, sorting and moving information between systems that were never designed to talk.', 'Where it doesn\u2019t help: deciding your positioning, your taste, and who to trust. That\u2019s still you.', 'The businesses winning with AI aren\u2019t the ones using it most. They automated the repetitive 30% and reinvested the time in the work only they can do.']
        },
        {
            n: '05', cat: 'SYSTEMS', time: '5 MIN', title: 'What should a business automate first?',
            body: ['Not the exciting stuff. The first automation candidates share three signs: you do them weekly, the steps never change, and mistakes cost you money.', 'For most businesses that means follow-ups (enquiries that never got a second reply), invoicing and reminders, reporting someone rebuilds by hand every Monday, and onboarding checklists living in someone\u2019s head.', 'Rule of thumb: if you\u2019ve explained it twice the same way, it\u2019s a system. If you\u2019ve done it thirty times identically, it\u2019s an automation.', 'Start with one. Document it, automate it, notice what breaks — that\u2019s where the next one is hiding. Automation isn\u2019t about doing less work. It\u2019s about making sure the work only you can do is what\u2019s left.']
        },
        {
            n: '06', cat: 'THINK', time: '4 MIN', title: 'What makes people remember a brand?',
            body: ['Memory is unfair. People don\u2019t remember the best product; they remember the most distinct one.', 'Three things survive contact with a crowded market: a point of view (what you believe that competitors don\u2019t say), a repeatable shape (a way of speaking, a visual tic, a ritual in how you deliver), and repetition (the discipline to stay the same longer than you got bored of it).', 'Most brands have none of the three, because consistency feels boring from the inside. From the outside it reads as reliability — and reliability is what memory is made of.', 'Decide what you want to be known for. Then resist the urge to say anything else.']
        }
    ];
    (function () {
        const list = $('#libList'), tabs = $('#libTabs');
        if (!list || !tabs) return;
        const areas = ['ALL', 'BUILD', 'PRESENCE', 'GROW', 'SYSTEMS', 'AI', 'THINK'];
        tabs.innerHTML = areas.map((a, i) => `<button class="lib-tab${i === 0 ? ' on' : ''}" role="tab" aria-selected="${i === 0}" data-a="${a}">${a}</button>`).join('');
        function render(filter) {
            list.innerHTML = ARTICLES.filter(a => filter === 'ALL' || a.cat === filter)
                .map(a => `<button class="lib-row" data-n="${a.n}" aria-label="Read: ${a.title}">
        <span class="lib-num">${a.n}</span><span class="lib-cat">${a.cat}</span>
        <span class="lib-title">${a.title}</span><span class="lib-meta">${a.time} READ</span></button>`).join('');
            $$('.lib-row', list).forEach(r => r.addEventListener('click', () => {
                const a = ARTICLES.find(x => x.n === r.dataset.n);
                const rb = $('#readBody');
                if (!rb) return;
                rb.innerHTML = `<span class="label">${a.n} — <b>${a.cat}</b> · ${a.time} READ</span>
        <h2 class="read-title">${a.title}</h2>
        <div class="read-essay">${a.body.map(p => `<p>${p}</p>`).join('')}</div>
        <div class="read-foot"><button class="btn btn-ghost" data-open-contact>PUT THIS TO WORK ${AR}</button></div>`;
                openOvl('#readOvl');
                bindContact(rb);
            }));
        }
        render('ALL');
        $$('.lib-tab', tabs).forEach(t => t.addEventListener('click', () => {
            $$('.lib-tab', tabs).forEach(x => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
            if (MOTION) gsap.fromTo('.lib-row', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power2.out' });
            render(t.dataset.a);
        }));
    })();

    /* ---------- overlays / modal ---------- */
    let lastFocus = null;
    function openOvl(sel) {
        lastFocus = document.activeElement;
        const o = $(sel); if (!o) return;
        o.classList.add('on'); document.body.style.overflow = 'hidden';
        const sc = $('.ovl-scroll', o); if (sc) sc.scrollTop = 0;
        const c = $('[data-close]', o); if (c) c.focus();
    }
    function closeOvls() {
        $$('.ovl.on,.modal.on').forEach(o => o.classList.remove('on'));
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }
    function bindContact(scope) {
        $$('[data-open-contact]', scope || document).forEach(b => {
            if (b._b) return; b._b = true;
            b.addEventListener('click', e => {
                e.preventDefault(); closeOvls();
                const m = $('#contactModal');
                if (m) { m.classList.add('on'); document.body.style.overflow = 'hidden'; }
                const cp = $('#copyEmail'); if (cp) cp.focus();
            });
        });
    }
    bindContact();
    $$('[data-close]').forEach(b => b.addEventListener('click', closeOvls));
    addEventListener('keydown', e => { if (e.key === 'Escape') closeOvls(); });
    const cpEmail = $('#copyEmail');
    if (cpEmail) {
        cpEmail.addEventListener('click', () => {
            const el = $('#cEmail');
            const t = el ? el.textContent : 'hello@doersinspire.com';
            (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(
                () => toast('EMAIL COPIED'),
                () => toast(t));
        });
    }

    /* ---------- magnetic CTAs ---------- */
    if (MOTION && FINE) {
        $$('.magnet').forEach(b => {
            b.addEventListener('mousemove', e => {
                const r = b.getBoundingClientRect();
                gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .14, y: (e.clientY - r.top - r.height / 2) * .26, duration: .5, ease: 'power3.out' });
            });
            b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'power3.out' }));
        });
    }

    /* ---------- social ecosystem ---------- */
    (function initSocialEcosystem() {
        const stage = $('#seStage');
        const svg = $('#seSvg');
        const nodesContainer = $('#seNodes');
        const centerNode = $('#seCenter');
        if (!stage || !svg || !nodesContainer || !centerNode) return;

        const platforms = [
            {
                id: 'youtube',
                name: 'YouTube',
                handle: '@DoersInspire',
                url: 'https://www.youtube.com/@DoersInspire',
                color: '#FF0000',
                glow: 'rgba(255, 0, 0, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
            },
            {
                id: 'x',
                name: 'X',
                handle: '@DoersInspire',
                url: 'https://x.com/DoersInspire',
                color: '#FFFFFF',
                glow: 'rgba(255, 255, 255, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
            },
            {
                id: 'instagram',
                name: 'Instagram',
                handle: '@doersinspire',
                url: 'https://www.instagram.com/doersinspire/',
                color: '#E1306C',
                glow: 'rgba(225, 48, 108, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>'
            },
            {
                id: 'producthunt',
                name: 'Product Hunt',
                handle: '@doersinspire',
                url: 'https://www.producthunt.com/@doersinspire',
                color: '#DA552F',
                glow: 'rgba(218, 85, 47, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13.604 8.4h-3.405v3.6h3.405c.995 0 1.801-.806 1.801-1.8s-.806-1.8-1.801-1.8zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.604 14.4h-3.405V18H7.799V6h5.805c2.321 0 4.201 1.88 4.201 4.2 0 2.32-1.88 4.2-4.201 4.2z"/></svg>'
            },
            {
                id: 'facebook',
                name: 'Facebook',
                handle: 'Doers Inspire',
                url: 'https://www.facebook.com/profile.php?id=61592541224233',
                color: '#1877F2',
                glow: 'rgba(24, 119, 242, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
            },
            {
                id: 'substack',
                name: 'Substack',
                handle: '@doersinspire',
                url: 'https://substack.com/@doersinspire',
                color: '#FF6719',
                glow: 'rgba(255, 103, 25, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.539 0H1.46v2.836h21.08V0z"/></svg>'
            },
            {
                id: 'skool',
                name: 'Skool',
                handle: '@pooja-sharma-8611',
                url: 'https://www.skool.com/@pooja-sharma-8611?g=sol-business-incubation-hub',
                color: '#2A81F6',
                glow: 'rgba(42, 129, 246, 0.4)',
                icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2L1 7l11 5 9-4.09V15h2V7L12 2zm-7 9.18V16c0 3.31 4.93 6 7 6s7-2.69 7-6v-4.82l-7 3.18-7-3.18z"/></svg>'
            }
        ];

        const angles = [-90, -35, 15, 65, 125, 175, 220];
        let nodesData = [];

        function layoutNodes() {
            const w = stage.clientWidth;
            const h = stage.clientHeight;
            const cx = w / 2;
            const cy = h / 2;

            const isMobile = w < 768;
            const isTablet = w >= 768 && w < 1024;
            const radiusX = isMobile ? Math.min(w * 0.34, 120) : (isTablet ? Math.min(w * 0.38, 220) : Math.min(w * 0.38, 540));
            const radiusY = isMobile ? Math.min(h * 0.35, 145) : (isTablet ? Math.min(h * 0.36, 200) : Math.min(h * 0.35, 290));

            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            nodesContainer.innerHTML = '';
            svg.innerHTML = '';
            nodesData = [];

            // Draw concentric orbital rings
            const ringRadii = isMobile ? [75, radiusX * 0.55, radiusX * 0.82, radiusX * 1.0] : [130, radiusX * 0.45, radiusX * 0.72, radiusX * 1.0];
            ringRadii.forEach(r => {
                const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                ring.setAttribute('cx', cx);
                ring.setAttribute('cy', cy);
                ring.setAttribute('r', r);
                ring.setAttribute('class', 'se-ring');
                svg.appendChild(ring);
            });

            platforms.forEach((p, idx) => {
                const angleRad = (angles[idx] * Math.PI) / 180;
                const nx = cx + radiusX * Math.cos(angleRad);
                const ny = cy + radiusY * Math.sin(angleRad);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', cx);
                line.setAttribute('y1', cy);
                line.setAttribute('x2', nx);
                line.setAttribute('y2', ny);
                line.setAttribute('class', 'se-line');
                line.setAttribute('id', `seLine-${p.id}`);
                svg.appendChild(line);

                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('cx', nx);
                dot.setAttribute('cy', ny);
                dot.setAttribute('r', '3.5');
                dot.setAttribute('class', 'se-dot');
                svg.appendChild(dot);

                const a = document.createElement('a');
                a.className = 'se-node';
                a.href = p.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.setAttribute('aria-label', `Visit DOERS INSPIRE on ${p.name}`);
                a.style.left = `${nx}px`;
                a.style.top = `${ny}px`;
                a.style.setProperty('--node-accent', p.color);
                a.style.setProperty('--node-glow', p.glow);

                a.innerHTML = `
                    <div class="se-node-icon">${p.icon}</div>
                    <div class="se-node-info">
                        <span class="se-node-name">${p.name}</span>
                        <span class="se-node-handle">${p.handle}</span>
                    </div>
                `;

                a.addEventListener('mouseenter', () => {
                    line.classList.add('active');
                    line.style.stroke = p.color;
                    dot.classList.add('active');
                    dot.style.fill = p.color;
                    dot.style.filter = `drop-shadow(0 0 6px ${p.color})`;
                });
                a.addEventListener('mouseleave', () => {
                    line.classList.remove('active');
                    line.style.stroke = '';
                    dot.classList.remove('active');
                    dot.style.fill = '';
                    dot.style.filter = '';
                });
                a.addEventListener('focus', () => {
                    line.classList.add('active');
                    line.style.stroke = p.color;
                    dot.classList.add('active');
                    dot.style.fill = p.color;
                    dot.style.filter = `drop-shadow(0 0 6px ${p.color})`;
                });
                a.addEventListener('blur', () => {
                    line.classList.remove('active');
                    line.style.stroke = '';
                    dot.classList.remove('active');
                    dot.style.fill = '';
                    dot.style.filter = '';
                });

                nodesContainer.appendChild(a);
                nodesData.push({ el: a, line: line, dot: dot, baseNx: nx, baseNy: ny, cx: cx, cy: cy, idx: idx });
            });
        }

        layoutNodes();
        window.addEventListener('resize', layoutNodes);

        if (MOTION && FINE) {
            nodesData.forEach((item, i) => {
                const dur = 4 + (i % 3) * 1.5;
                const dy = 6 + (i % 2) * 4;
                gsap.to(item.el, {
                    y: `+=${dy}`,
                    duration: dur,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    delay: i * 0.4
                });
            });

            stage.addEventListener('mousemove', (e) => {
                const rect = stage.getBoundingClientRect();
                const mx = (e.clientX - rect.left - rect.width / 2) * 0.04;
                const my = (e.clientY - rect.top - rect.height / 2) * 0.04;

                gsap.to(centerNode, { x: mx * 0.6, y: my * 0.6, duration: 0.6, ease: 'power2.out' });
                nodesData.forEach((item) => {
                    gsap.to(item.el, { x: mx * (1 + (item.idx % 3) * 0.2), duration: 0.6, ease: 'power2.out' });
                });
            });

            stage.addEventListener('mouseleave', () => {
                gsap.to([centerNode, ...nodesData.map(n => n.el)], { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
            });
        }
    })();
    if (MOTION && document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();

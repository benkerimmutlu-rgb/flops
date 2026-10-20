/** @param {HTMLElement} root */
export function mountPoseMotion(root) {
    let disposed = false, raf = 0, observer = null;
    const controller = new AbortController();
    const listen = (target, type, handler) => target.addEventListener(type, handler, { signal: controller.signal });
    (async () => {
        const host = root.querySelector('.kids-mascot');
        const sequences = Object.fromEntries(['wave', 'sit', 'jump', 'sleep'].map(n => [n, '/assets/clay/animation/' + n + '.webp'])), poses = Object.fromEntries(['wave', 'sit', 'jump', 'sleep'].map(n => [n, { image: '/assets/clay/pose-' + n + '.webp' }]));
        const names = ['wave', 'sit', 'jump', 'sleep'], reduced = matchMedia('(prefers-reduced-motion: reduce)');
        function load(src) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }
        const originals = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await load(poses[n].image)])));
        const atlases = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await load(sequences[n])])));
        const compact = await load('/assets/clay/compact-v5.webp');
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { alpha: true });
        canvas.setAttribute('aria-hidden', 'true');
        if (disposed)
            return;
        host.append(canvas);
        root.dataset.motionReady = 'true';
        const requested = 'wave';
        let current = names.includes(requested) ? requested : 'wave', next = current, pending = null, busy = false, start = 0, clock = 0, last = performance.now(), auto = 3.2;
        root.dataset.pose = current;
        observer = new ResizeObserver(entries => { const r = entries[0].contentRect, dpr = Math.min(devicePixelRatio, 2); canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr)); });
        observer.observe(host);
        function done() { current = next; busy = false; root.dataset.pose = current; delete root.dataset.morphing; root.dispatchEvent(new CustomEvent('kids:pose-changed', { detail: current })); auto = clock + 4.6; }
        function choose(name) { if (!names.includes(name))
            return; if (reduced.matches) {
            next = name;
            done();
            return;
        } if (busy) {
            pending = name;
            return;
        } if (name === current) {
            auto = clock + 4.6;
            return;
        } next = name; start = clock; busy = true; root.dataset.morphing = current + ':' + name; }
        listen(root, 'kids:pose', e => choose(e.detail));
        listen(reduced, 'change', () => { if (reduced.matches)
            done(); });
        function paint(image, frame = null) { const w = canvas.width, h = canvas.height; ctx.clearRect(0, 0, w, h); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; if (frame === null) {
            ctx.drawImage(image, 0, 0, w, h);
            return;
        } const tile = image.width / 4, x = frame % 4, y = Math.floor(frame / 4); ctx.drawImage(image, x * tile, y * tile, tile, tile, 0, 0, w, h); }
        function draw(now) {
            const dt = Math.min(.06, (now - last) / 1000);
            last = now;
            if (!root.classList.contains('kids-paused') && document.visibilityState === 'visible')
                clock += dt;
            const duration = Number(root.dataset.morphDuration) || 3.2;
            let t = busy ? Math.min(1, (clock - start) / duration) : 0;
            if (busy && t >= 1) {
                done();
                t = 0;
                if (pending) {
                    const name = pending;
                    pending = null;
                    choose(name);
                }
            }
            if (!busy) {
                paint(originals[current]);
                root.dataset.frame = 'rest';
                if (!reduced.matches && clock > auto)
                    choose(names[(names.indexOf(current) + 1) % names.length]);
            }
            else if (t < .44) {
                const f = Math.floor(t / .44 * 16);
                if (f === 0)
                    paint(originals[current]);
                else if (f >= 15)
                    paint(compact);
                else
                    paint(atlases[current], f);
                root.dataset.frame = current + ':' + f;
            }
            else if (t <= .56) {
                paint(compact);
                root.dataset.frame = 'compact';
            }
            else {
                const f = 15 - Math.floor((t - .56) / .44 * 16);
                if (f <= 0)
                    paint(originals[next]);
                else if (f >= 15)
                    paint(compact);
                else
                    paint(atlases[next], f);
                root.dataset.frame = next + ':' + f;
            }
            raf = requestAnimationFrame(draw);
        }
        raf = requestAnimationFrame(draw);
    })().catch(error => { if (!disposed)
        console.warn('FLOPS pose image fallback', error); });
    return () => { disposed = true; controller.abort(); observer?.disconnect(); cancelAnimationFrame(raf); root.querySelector('.kids-mascot canvas')?.remove(); delete root.dataset.motionReady; };
}

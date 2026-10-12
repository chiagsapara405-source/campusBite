// Inspect computed color of hero H1 spans in light & dark mode via CDP.
// Usage: node scripts/inspect-hero.mjs <httpUrl>
import CDP from 'chrome-remote-interface';

const url = process.argv[2] || 'http://localhost/campusBite/index.php';

async function launchChrome() {
  const { spawn } = await import('child_process');
  const chrome = spawn(
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--remote-debugging-port=9222', '--user-data-dir=C:/tmp/cb-chrome-profile',
    ],
    { stdio: 'ignore' }
  );
  // wait for the debug endpoint
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) return chrome;
    } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  chrome.kill();
  throw new Error('Chrome debug port never came up');
}

const chrome = await launchChrome();
try {
  const client = await CDP({ port: 9222 });
  const targetId = client.target.id ?? (client.target || {}).targetId;
  const { Page, Runtime } = client;

  await Page.enable();
  await Page.navigate({ url });
  await Page.loadEventFired();

  const evalJs = async (expr) => {
    const r = await Runtime.evaluate({ expression: expr, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  // wait for Tailwind CDN compiler to have generated its stylesheet
  await evalJs(`(async () => {
    for (let i = 0; i < 80; i++) {
      const ok = [...document.styleSheets].some(s => {
        try { return s.cssRules.length > 50 && /tailwind|<style/i.test(s.ownerNode?.id || s.ownerNode?.tagName || ''); } catch { return false; }
      });
      const h1 = document.querySelector('h1');
      const ready = h1 && getComputedStyle(h1).fontSize === '48px';
      if (ready) return 'ready';
      await new Promise(r => setTimeout(r, 250));
    }
    return 'timeout';
  })()`);

  const inspect = `(() => {
    const h1 = document.querySelector('h1');
    if (!h1) return { error: 'no h1' };
    const cs = getComputedStyle(h1);
    const words = {};
    walk(h1);
    function walk(el) {
      for (const node of el.childNodes) {
        if (node.nodeType === 3) {
          const t = node.textContent.trim();
          if (t) words[t.slice(0, 12)] = getComputedStyle(node.parentElement).color;
        } else if (node.nodeType === 1) walk(node);
      }
    }
    return {
      htmlClass: document.documentElement.className,
      h1Color: cs.color,
      fontFamily: cs.fontFamily.slice(0, 40),
      fontSize: cs.fontSize,
      words,
      gradientEls: [...document.querySelectorAll('.text-gradient')].map(e => ({
        text: e.textContent.trim().slice(0, 14),
        color: getComputedStyle(e).color,
        fillColor: getComputedStyle(e).webkitTextFillColor,
        bgImage: getComputedStyle(e).backgroundImage.slice(0, 60),
      })),
    };
  })()`;

  console.log('=== DARK AS BOOTED ===');
  console.log(JSON.stringify(await evalJs(inspect), null, 2));

  // Simulate the user toggling to light: remove .dark DON'T touch media state
  const media = await evalJs(`window.matchMedia('(prefers-color-scheme: dark)').matches`);
  console.log('prefers-color-scheme dark =', media);
  await evalJs(`document.documentElement.classList.remove('dark'); 'ok'`);
  console.log('=== LIGHT (.dark removed) ===');
  console.log(JSON.stringify(await evalJs(inspect), null, 2));

  // Check which rules Tailwind actually generated for the variants we rely on
  const ruleProbe = await evalJs(`(() => {
    const out = { textInk: [], darkStone100: [], darkStone200: [], variantCount: 0 };
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of rules) {
        const sel = r.selectorText || '';
        const css = r.cssText || '';
        if (/\\.text-ink\\b/.test(sel)) out.textInk.push(css.slice(0, 120));
        if (/dark\\\\:text-stone-100/.test(sel)) { out.darkStone100.push(css.slice(0, 160)); }
        if (/dark\\\\:text-stone-200/.test(sel)) out.darkStone200.push(sel.slice(0, 80));
        if (sel.startsWith('.dark')) out.variantCount++;
      }
    }
    return out;
  })()`);
  console.log('=== GENERATED RULES ===');
  console.log(JSON.stringify(ruleProbe, null, 2));

  await client.close();
} finally {
  chrome.kill();
}

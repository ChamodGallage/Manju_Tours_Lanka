import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getWebSocketDebuggerUrl() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json/version`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.webSocketDebuggerUrl);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== Starting Complete Browser Navigation Verification ===');
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--window-size=1440,900',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      '--user-data-dir=C:\\Users\\gcham\\.gemini\\antigravity-ide\\brain\\e1b67ad2-7c0e-4fc0-810b-2051a7950c02\\scratch\\chrome_verify_all',
      'http://localhost:3000',
    ],
    { stdio: 'ignore' }
  );

  let wsUrl;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      wsUrl = await getWebSocketDebuggerUrl();
      if (wsUrl) break;
    } catch {}
  }

  const targetsRes = await (new Promise((resolve) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json/list`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    });
  }));

  const pageTarget = targetsRes.find((t) => t.type === 'page' && t.url.includes('localhost:3000'));
  const pageWs = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let pageId = 1;
  const pageCallbacks = new Map();

  function sendPage(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = pageId++;
      pageCallbacks.set(msgId, resolve);
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  pageWs.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pageCallbacks.has(msg.id)) {
      pageCallbacks.get(msg.id)(msg.result);
      pageCallbacks.delete(msg.id);
    }
  };

  await new Promise((resolve) => (pageWs.onopen = resolve));
  await sendPage('Runtime.enable');
  await sendPage('Page.enable');
  await sleep(3000);

  const results = [];

  async function testAction(name, actionFn, verifyFn) {
    await sendPage('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);
    try {
      await actionFn();
      await sleep(1500);
      const passed = await verifyFn();
      results.push({ name, passed });
      console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}`);
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
      console.log(`[FAIL] ${name} - Error: ${err.message}`);
    }
  }

  // 1. Header Desktop Links
  await testAction(
    'Header "Tours" link navigates to /tours',
    async () => {
      await sendPage('Runtime.evaluate', { expression: `document.querySelector('header nav a[href="/tours"]').click()` });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/tours';
    }
  );

  await testAction(
    'Header "About Manju" link navigates to /about',
    async () => {
      await sendPage('Runtime.evaluate', { expression: `document.querySelector('header nav a[href="/about"]').click()` });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/about';
    }
  );

  await testAction(
    'Header "Contact" link navigates to /contact',
    async () => {
      await sendPage('Runtime.evaluate', { expression: `document.querySelector('header nav a[href="/contact"]').click()` });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/contact';
    }
  );

  // 2. Header Destinations Dropdown
  await testAction(
    'Header "Destinations" button opens mega menu',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.includes('Destinations'));
          btn.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', {
        expression: `!!document.querySelector('header a[href="/destinations/sigiriya"]')`,
        returnByValue: true
      });
      return res.result.value === true;
    }
  );

  // 3. QuickLinksStrip: Check hit test & no overlap
  await testAction(
    'QuickLinksStrip is NOT covered by PlanTripWidget (Overlap check)',
    async () => {},
    async () => {
      const res = await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const q = document.querySelector('div[class*="Quick Navigator"]')?.closest('div.bg-white') || document.querySelector('div.bg-white.rounded-3xl.p-3');
          const p = document.querySelector('section.relative.mt-8') || document.querySelector('form')?.closest('section');
          if (!q || !p) return false;
          const qRect = q.getBoundingClientRect();
          const pRect = p.getBoundingClientRect();
          return pRect.top >= qRect.bottom; // No overlap!
        })()`,
        returnByValue: true
      });
      return res.result.value === true;
    }
  );

  // 4. QuickLinksStrip: Click "Things to Do"
  await testAction(
    'QuickLinksStrip "Things to Do" link navigates to /experiences',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const link = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Things to Do'));
          link.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/experiences';
    }
  );

  // 5. QuickLinksStrip: Click "Visa Info" button opens Travel Essentials Modal
  await testAction(
    'QuickLinksStrip "Visa Info" button opens TravelEssentialsModal',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Visa Info'));
          btn.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', {
        expression: `!!document.querySelector('h2')?.innerText.includes('Travel Essentials') || !!document.querySelector('div[class*="fixed inset-0 z-50"]')`,
        returnByValue: true
      });
      return res.result.value === true;
    }
  );

  // 6. PlanTripWidget form submission
  await testAction(
    'PlanTripWidget submit navigates to /custom-tour with query params',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const form = document.querySelector('form');
          const submitBtn = form?.querySelector('button[type="submit"]') || form?.querySelector('button:last-of-type');
          if (submitBtn) submitBtn.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/custom-tour';
    }
  );

  // 7. Experience Pillars fixed slugs test
  await testAction(
    'Experience Pillar "Pristine" navigates to /experiences/mirissa-whale-watching',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const link = document.querySelector('a[href="/experiences/mirissa-whale-watching"]');
          link.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/experiences/mirissa-whale-watching';
    }
  );

  await testAction(
    'Experience Pillar "Bliss" navigates to /experiences/ceylon-artisan-tea-experience',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const link = document.querySelector('a[href="/experiences/ceylon-artisan-tea-experience"]');
          link.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/experiences/ceylon-artisan-tea-experience';
    }
  );

  // 8. Destination Card click
  await testAction(
    'Destination Card navigates to /destinations/sigiriya',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const link = document.querySelector('a[href="/destinations/sigiriya"]');
          link.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/destinations/sigiriya';
    }
  );

  // 9. Footer links click
  await testAction(
    'Footer link navigates to /credits',
    async () => {
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const link = document.querySelector('footer a[href="/credits"]');
          link.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/credits';
    }
  );

  // 10. Mobile Menu test (375x667)
  console.log('Testing Mobile Viewport (375x667)...');
  await sendPage('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(2500);
  await sendPage('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1000);

  await testAction(
    'Mobile Hamburger button opens drawer and "Tours & Itineraries" navigates',
    async () => {
      // Click hamburger
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('header button[aria-label="Open navigation menu"]');
          btn.click();
        })()`
      });
      await sleep(500);
      // Click Tours link inside drawer
      await sendPage('Runtime.evaluate', {
        expression: `(() => {
          const toursLink = document.querySelector('div.fixed.inset-0 a[href="/tours"]');
          toursLink.click();
        })()`
      });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/tours';
    }
  );

  // 11. Admin redirection
  await testAction(
    'Admin access /admin redirects unauthenticated user to /admin/login',
    async () => {
      await sendPage('Page.navigate', { url: 'http://localhost:3000/admin' });
    },
    async () => {
      const res = await sendPage('Runtime.evaluate', { expression: `window.location.pathname`, returnByValue: true });
      return res.result.value === '/admin/login';
    }
  );

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\n=== Verification Complete: ${passedCount}/${results.length} PASSED ===`);

  pageWs.close();
  chrome.kill();
  return passedCount === results.length;
}

main().catch(console.error);

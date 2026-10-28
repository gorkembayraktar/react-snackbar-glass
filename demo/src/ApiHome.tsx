import { useCallback, useEffect, useRef, useState } from 'react';
import { SnackbarProvider, toast } from '../../src';

/* ----------------------------------------------------------------- content */

const INSTALL = 'npm install react-snackbar-glass';

const STEP_INSTALL = `npm install react-snackbar-glass`;

const STEP_MOUNT = `import { SnackbarProvider } from 'react-snackbar-glass';
import 'react-snackbar-glass/styles.css';

export default function Root() {
  return (
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
}`;

const STEP_CALL = `import { toast } from 'react-snackbar-glass';

toast.success('Draft saved to your workspace.');

// Anywhere: event handlers, API clients, plain modules.
toast.error('Upload failed', { action: { label: 'Retry', onClick: retry } });`;

interface Example {
  id: string;
  group: string;
  label: string;
  code: string;
  note: string;
  run: () => void;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

const EXAMPLES: Example[] = [
  {
    id: 'success',
    group: 'Basics',
    label: 'toast.success()',
    code: `toast.success('Draft saved to your workspace.', {
  title: 'Saved',
});`,
    note: 'A titled confirmation. Auto-dismisses after 5 seconds.',
    run: () =>
      toast.success('Draft saved to your workspace.', { title: 'Saved' }),
  },
  {
    id: 'error',
    group: 'Basics',
    label: 'toast.error()',
    code: `toast.error('The card issuer rejected the charge.', {
  title: 'Payment declined',
  action: { label: 'Try again', onClick: retry },
});`,
    note: 'Variant sets the colour and icon. `action` renders one button.',
    run: () =>
      toast.error('The card issuer rejected the charge.', {
        title: 'Payment declined',
        action: {
          label: 'Try again',
          onClick: () => {
            toast.info('Retrying the charge…');
          },
        },
      }),
  },
  {
    id: 'warning',
    group: 'Basics',
    label: 'toast.warning()',
    code: `toast.warning('92% of workspace storage is in use.', {
  title: 'Storage almost full',
});`,
    note: 'Same API, different tone. Nothing else to configure.',
    run: () =>
      toast.warning('92% of workspace storage is in use.', {
        title: 'Storage almost full',
      }),
  },
  {
    id: 'info',
    group: 'Basics',
    label: 'toast.info()',
    code: `toast.info('Build #4821 finished in 42s.');`,
    note: 'Message only — no title needed for short updates.',
    run: () => toast.info('Build #4821 finished in 42s.'),
  },
  {
    id: 'single',
    group: 'Shapes',
    label: 'toast.single()',
    code: `toast.single('Position set to top-center', {
  variant: 'success',
});`,
    note: 'One line, content width, never wraps. Instant feedback.',
    run: () =>
      toast.single('Position set to top-center', { variant: 'success' }),
  },
  {
    id: 'compact',
    group: 'Shapes',
    label: 'compact: true',
    code: `toast.success('Synced just now', { compact: true });`,
    note: 'A pill-shaped single line for high-frequency messages.',
    run: () => toast.success('Synced just now', { compact: true }),
  },
  {
    id: 'card',
    group: 'Shapes',
    label: 'layout: "card"',
    code: `toast({
  title: 'Export ready',
  message: '248 rows · 42 KB',
  duration: 6000,
});`,
    note: 'The default: title, message, optional action and a hairline.',
    run: () =>
      toast({
        title: 'Export ready',
        message: '248 rows · 42 KB',
        duration: 6000,
      }),
  },
  {
    id: 'loading',
    group: 'Flows',
    label: 'loading → update',
    code: `const id = toast.loading('Uploading 19 assets…');

await upload();

toast.update(id, {
  variant: 'success',
  title: 'Upload complete',
  duration: 3200,
});`,
    note: 'Keep the id, morph the same snackbar. No duplicate.',
    run: () => {
      const id = toast.loading('Uploading 19 assets…', {
        title: 'Uploading',
      });
      window.setTimeout(() => {
        toast.update(id, {
          variant: 'success',
          title: 'Upload complete',
          message: '19 assets are ready to use.',
          duration: 3200,
        });
      }, 1600);
    },
  },
  {
    id: 'promise',
    group: 'Flows',
    label: 'toast.promise()',
    code: `toast.promise(saveSettings(), {
  loading: 'Saving…',
  success: 'Settings saved',
  error: (error) => error.message,
});`,
    note: 'One call for all three states — including the failure path.',
    run: () => {
      const task = saveSettings();
      void toast
        .promise(task, {
          loading: 'Saving…',
          success: 'Settings saved',
          error: (error) =>
            error instanceof Error ? error.message : 'Could not save.',
        })
        .catch(() => undefined);
    },
  },
  {
    id: 'motion',
    group: 'Flows',
    label: 'animation: "pop"',
    code: `toast.error('Deploy failed', {
  animation: 'pop',       // slide | fade | scale | pop | flip | none
  exitAnimation: 'none',
});`,
    note: 'Pick the motion per snackbar, or set it on the provider.',
    run: () =>
      toast.error('Deploy failed', {
        animation: 'pop',
        exitAnimation: 'none',
        duration: 4000,
      }),
  },
  {
    id: 'minimize',
    group: 'Stacks',
    label: 'toast.minimize()',
    code: `toast.minimize();    // collapse the stack into one pill
toast.expand();      // bring the cards back
toast.isMinimized(); // boolean`,
    note: 'Three quick calls keep a busy screen calm.',
    run: () => {
      toast.success('First notification');
      toast.info('Second notification');
      toast.warning('Third notification');
      toast.minimize();
    },
  },
  {
    id: 'dismiss',
    group: 'Stacks',
    label: 'toast.dismissAll()',
    code: `toast.dismissAll();`,
    note: 'Clears every visible snackbar at once.',
    run: () => toast.dismissAll(),
  },
];

function saveSettings(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 1600));
}

/* ------------------------------------------------------------------- page */

export default function ApiHome() {
  const [activeId, setActiveId] = useState(EXAMPLES[0]!.id);
  const active = EXAMPLES.find((example) => example.id === activeId)!;

  return (
    <SnackbarProvider position="bottom-right" duration={5200} theme="light">
      <div className="docs">
        <header className="topbar">
          <a className="brand" href="#top">
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__name">Glass Snackbar</span>
            <span className="brand__tag">v1.3</span>
          </a>

          <nav className="topbar__nav" aria-label="Sections">
            <a href="#start">Get started</a>
            <a href="#playground">Playground</a>
            <a href="#api">API</a>
            <a href="#options">Options</a>
          </nav>

          <div className="topbar__actions">
            <a
              className="ghost-link"
              href="https://www.npmjs.com/package/react-snackbar-glass"
            >
              npm
            </a>
            <a
              className="ghost-link"
              href="https://github.com/gorkembayraktar/react-snackbar-glass"
            >
              GitHub
            </a>
          </div>
        </header>

        <main id="top">
          <section className="hero">
            <p className="eyebrow">React 18 + 19 · zero dependencies</p>
            <h1>
              Notifications in <em>one line</em> of code.
            </h1>
            <p className="hero__lede">
              A glassmorphic snackbar system for React. Install it, wrap your
              app once, then call <code>toast</code> from anywhere — no hooks,
              no context plumbing.
            </p>

            <InstallBar command={INSTALL} />

            <div className="hero__actions">
              <a className="button button--solid" href="#playground">
                Try it live
              </a>
              <a className="button button--quiet" href="#start">
                Read the 3 steps
              </a>
            </div>

            <ul className="hero__facts">
              <li>6 placements</li>
              <li>Promise aware</li>
              <li>Swipe to dismiss</li>
              <li>6 motion presets</li>
            </ul>
          </section>

          <section className="section" id="start">
            <header className="section__head">
              <span className="step-index">01 – 03</span>
              <h2>Three steps to your first snackbar</h2>
            </header>

            <div className="steps">
              <article className="step">
                <span className="step__badge">01</span>
                <h3>Install</h3>
                <p>One package, no peer dependencies beyond React.</p>
                <CodeBlock code={STEP_INSTALL} tone="terminal" />
              </article>

              <article className="step">
                <span className="step__badge">02</span>
                <h3>Mount the provider</h3>
                <p>
                  Once, near the root. It renders the notification layer and
                  owns the queue.
                </p>
                <CodeBlock code={STEP_MOUNT} />
              </article>

              <article className="step">
                <span className="step__badge">03</span>
                <h3>Call it</h3>
                <p>
                  Import <code>toast</code> anywhere — components, stores,
                  fetch wrappers, workers.
                </p>
                <CodeBlock code={STEP_CALL} />
              </article>
            </div>
          </section>

          <section className="section" id="playground">
            <header className="section__head">
              <span className="step-index">Playground</span>
              <h2>Click a call, see the result</h2>
              <p className="section__lede">
                Every button below runs the exact snippet printed next to it.
              </p>
            </header>

            <div className="playground">
              <div className="playground__list">
                {groupBy(EXAMPLES, (example) => example.group).map(
                  ([group, items]) => (
                    <div className="example-group" key={group}>
                      <span className="example-group__label">{group}</span>
                      <div className="example-group__buttons">
                        {items.map((example) => (
                          <button
                            key={example.id}
                            type="button"
                            className={`chip${
                              example.id === activeId ? ' is-active' : ''
                            }`}
                            aria-pressed={example.id === activeId}
                            onClick={() => {
                              setActiveId(example.id);
                              example.run();
                            }}
                          >
                            {example.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="playground__code">
                <CodeBlock code={active.code} label={active.label} />
                <p className="playground__note">{active.note}</p>
              </div>
            </div>
          </section>

          <section className="section" id="api">
            <header className="section__head">
              <span className="step-index">API</span>
              <h2>The whole surface</h2>
              <p className="section__lede">
                Every method returns the snackbar id unless noted.
              </p>
            </header>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Call</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>toast(message)</code>
                    </td>
                    <td>Default snackbar. Also accepts an options object.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.success()</code>
                    </td>
                    <td>
                      Variants: <code>success</code>, <code>error</code>,{' '}
                      <code>warning</code>, <code>info</code>,{' '}
                      <code>neutral</code>, <code>loading</code>,{' '}
                      <code>custom</code>.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.single(message)</code>
                    </td>
                    <td>
                      One-line status message (<code>layout: 'inline'</code>).
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.show(options)</code>
                    </td>
                    <td>Fully explicit options object.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.update(id, patch)</code>
                    </td>
                    <td>Morphs an existing snackbar in place.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.dismiss(id?)</code>
                    </td>
                    <td>Closes one snackbar, or all when called bare.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.dismissAll()</code>
                    </td>
                    <td>Clears the stack.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.promise(task, messages)</code>
                    </td>
                    <td>
                      Loading → success/error in a single call. Returns the
                      original promise.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>toast.minimize()</code> · <code>expand()</code>
                    </td>
                    <td>Collapse the stack into one summary pill, or restore.</td>
                  </tr>
                  <tr>
                    <td>
                      <code>useSnackbar()</code>
                    </td>
                    <td>
                      Same methods, scoped to the nearest provider. Use it
                      inside React when you want explicit context.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>useSnackbarStore()</code>
                    </td>
                    <td>Subscribe to the raw queue for custom UI.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="options">
            <header className="section__head">
              <span className="step-index">Options</span>
              <h2>The options that matter</h2>
              <p className="section__lede">
                Everything is optional; the defaults are designed to be left
                alone.
              </p>
            </header>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Values</th>
                    <th>Default</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>layout</code>
                    </td>
                    <td>
                      <code>'card'</code> · <code>'compact'</code> ·{' '}
                      <code>'inline'</code>
                    </td>
                    <td>
                      <code>'card'</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>position</code>
                    </td>
                    <td>top/bottom × left/center/right</td>
                    <td>
                      <code>'bottom-right'</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>duration</code>
                    </td>
                    <td>
                      ms · <code>null</code> keeps it open
                    </td>
                    <td>
                      <code>5000</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>animation</code>
                    </td>
                    <td>
                      <code>slide</code> <code>fade</code> <code>scale</code>{' '}
                      <code>pop</code> <code>flip</code> <code>none</code>
                    </td>
                    <td>
                      <code>'slide'</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>tone</code>
                    </td>
                    <td>
                      <code>'glass'</code> · <code>'solid'</code>
                    </td>
                    <td>
                      <code>'glass'</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>size</code>
                    </td>
                    <td>
                      <code>xs</code> <code>sm</code> <code>md</code>{' '}
                      <code>lg</code>
                    </td>
                    <td>
                      <code>'md'</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <code>title</code> · <code>message</code>
                    </td>
                    <td>string or any React node</td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>
                      <code>action</code>
                    </td>
                    <td>
                      <code>{'{ label, onClick }'}</code>
                    </td>
                    <td>—</td>
                  </tr>
                  <tr>
                    <td>
                      <code>dismissible</code> · <code>progress</code>
                    </td>
                    <td>boolean</td>
                    <td>
                      <code>true</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="theming">
            <header className="section__head">
              <span className="step-index">Theme</span>
              <h2>Make it yours</h2>
              <p className="section__lede">
                Colours, radii and motion are plain CSS custom properties.
              </p>
            </header>

            <div className="split">
              <CodeBlock
                label="theme.css"
                code={`:root {
  --prs-accent: #6d5efc;
  --prs-radius: 18px;
  --prs-width: 400px;
  --prs-enter-duration: 320ms;
  --prs-exit-duration: 160ms;
}`}
              />
              <div className="split__aside">
                <p>
                  Or scope it to one snackbar with the <code>style</code> prop,
                  or switch surface with <code>tone="solid"</code>.
                </p>
                <p>
                  <code>prefers-reduced-motion</code> is respected out of the
                  box, and the exit animation is awaited before a snackbar is
                  removed from the DOM.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer">
          <span>MIT · react-snackbar-glass</span>
          <nav aria-label="Footer">
            <a href="#top">Back to top</a>
            <a href="https://github.com/gorkembayraktar/react-snackbar-glass">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/react-snackbar-glass">
              npm
            </a>
          </nav>
        </footer>
      </div>
    </SnackbarProvider>
  );
}

/* ------------------------------------------------------------- primitives */

function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const name = key(item);
    const bucket = groups.get(name);
    if (bucket) bucket.push(item);
    else groups.set(name, [item]);
  }
  return [...groups.entries()];
}

function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(() => {
    const done = () => {
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    };

    // The async clipboard needs a focused, secure context; fall back to a
    // selection-based copy so the button always gives feedback.
    const legacyCopy = () => {
      try {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        document.body.removeChild(field);
        done();
      } catch {
        setCopied(false);
      }
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(done, legacyCopy);
      return;
    }
    legacyCopy();
  }, [value]);

  return { copied, copy };
}

function InstallBar({ command }: { command: string }) {
  const { copied, copy } = useCopy(command);

  return (
    <div className="install">
      <span className="install__prompt" aria-hidden="true">
        $
      </span>
      <code className="install__code">{command}</code>
      <button type="button" className="install__copy" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

function CodeBlock({
  code,
  label,
  tone,
}: {
  code: string;
  label?: string;
  tone?: 'terminal';
}) {
  const { copied, copy } = useCopy(code);

  return (
    <div className={`code${tone === 'terminal' ? ' code--terminal' : ''}`}>
      <div className="code__bar">
        <span className="code__label">{label ?? 'tsx'}</span>
        <button type="button" className="code__copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

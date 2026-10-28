import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SnackbarProvider,
  toast,
  useSnackbarStore,
} from '../../src';
import type {
  SnackbarAnimation,
  SnackbarCloseReason,
  SnackbarLayout,
  SnackbarOptions,
  SnackbarPosition,
  SnackbarRecord,
} from '../../src';

/* ----------------------------------------------------------------- content */

const INSTALL = 'npm install react-snackbar-glass';

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

/* ----------------------------------------------------------------- controls */

interface Controls {
  message: string;
  layout: SnackbarLayout;
  position: SnackbarPosition;
  animation: SnackbarAnimation;
  duration: number;
}

const DEFAULT_CONTROLS: Controls = {
  message: '',
  layout: 'card',
  position: 'bottom-right',
  animation: 'slide',
  duration: 5200,
};

const LAYOUTS: { value: SnackbarLayout; label: string }[] = [
  { value: 'card', label: 'Card' },
  { value: 'compact', label: 'Compact' },
  { value: 'inline', label: 'Single line' },
];

const POSITIONS: { value: SnackbarPosition; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-center', label: 'Top center' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-center', label: 'Bottom center' },
  { value: 'bottom-right', label: 'Bottom right' },
];

const ANIMATIONS: { value: SnackbarAnimation; label: string }[] = [
  { value: 'slide', label: 'Slide' },
  { value: 'fade', label: 'Fade' },
  { value: 'scale', label: 'Scale' },
  { value: 'pop', label: 'Pop' },
  { value: 'flip', label: 'Flip' },
  { value: 'none', label: 'None' },
];

/** Typed options for the actual call — always explicit, never stale. */
function baseOptions(controls: Controls): SnackbarOptions {
  return {
    layout: controls.layout,
    position: controls.position,
    animation: controls.animation,
    duration: controls.duration,
  };
}

/** The same options, printed only where they differ from the defaults. */
function visualLines(
  controls: Controls,
  skip: { duration?: boolean; layout?: boolean } = {},
): string {
  const lines: string[] = [];
  if (!skip.layout && controls.layout !== DEFAULT_CONTROLS.layout) {
    lines.push(`layout: '${controls.layout}',`);
  }
  if (controls.position !== DEFAULT_CONTROLS.position) {
    lines.push(`position: '${controls.position}',`);
  }
  if (controls.animation !== DEFAULT_CONTROLS.animation) {
    lines.push(`animation: '${controls.animation}',`);
  }
  if (!skip.duration && controls.duration !== DEFAULT_CONTROLS.duration) {
    lines.push(`duration: ${controls.duration},`);
  }
  return lines.map((line) => `\n  ${line}`).join('');
}

function textFor(controls: Controls, fallback: string): string {
  return controls.message.trim() || fallback;
}

/**
 * Inline snackbars are a single line by contract, so a title would be silently
 * dropped. Keep the snippet honest: hide it when that layout is selected.
 */
function titleLine(controls: Controls, title: string): string {
  return controls.layout === 'inline' ? '' : `\n  title: '${title}',`;
}

function titleOption(controls: Controls, title: string): { title?: string } {
  return controls.layout === 'inline' ? {} : { title };
}

function quote(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function saveSettings(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 1600));
}

/* ---------------------------------------------------------------- scenarios */

interface Built {
  label: string;
  code: string;
  note: string;
  run: () => void;
}

interface Scenario {
  id: string;
  group: string;
  label: string;
  build: (controls: Controls) => Built;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'success',
    group: 'Basics',
    label: 'success',
    build: (controls) => {
      const text = textFor(controls, 'Draft saved to your workspace.');
      const lines = visualLines(controls);

      return {
        label: 'toast.success()',
        code: `toast.success(${quote(text)}, {${titleLine(controls, 'Saved')}${lines}\n});`,
        note:
          controls.layout === 'inline'
            ? 'Inline keeps one line, so the title is left out on purpose.'
            : 'A titled confirmation. Every control on the left lands here.',
        run: () =>
          toast.success(text, {
            ...titleOption(controls, 'Saved'),
            ...baseOptions(controls),
          }),
      };
    },
  },
  {
    id: 'error',
    group: 'Basics',
    label: 'error',
    build: (controls) => {
      const text = textFor(controls, 'The card issuer rejected the charge.');
      const lines = visualLines(controls);

      return {
        label: 'toast.error()',
        code: `toast.error(${quote(text)}, {${titleLine(controls, 'Payment declined')}${lines}\n  action: { label: 'Try again', onClick: retry },\n});`,
        note: 'Variant drives colour and icon; `action` adds one button.',
        run: () =>
          toast.error(text, {
            ...titleOption(controls, 'Payment declined'),
            ...baseOptions(controls),
            action: {
              label: 'Try again',
              onClick: () => {
                toast.info('Retrying the charge…');
              },
            },
          }),
      };
    },
  },
  {
    id: 'warning',
    group: 'Basics',
    label: 'warning',
    build: (controls) => {
      const text = textFor(controls, '92% of workspace storage is in use.');
      const lines = visualLines(controls);

      return {
        label: 'toast.warning()',
        code: `toast.warning(${quote(text)}, {${titleLine(controls, 'Storage almost full')}${lines}\n});`,
        note: 'Same API, different tone — nothing else to wire up.',
        run: () =>
          toast.warning(text, {
            ...titleOption(controls, 'Storage almost full'),
            ...baseOptions(controls),
          }),
      };
    },
  },
  {
    id: 'info',
    group: 'Basics',
    label: 'info',
    build: (controls) => {
      const text = textFor(controls, 'Build #4821 finished in 42s.');
      const lines = visualLines(controls);

      return {
        label: 'toast.info()',
        code: lines
          ? `toast.info(${quote(text)}, {${lines}\n});`
          : `toast.info(${quote(text)});`,
        note: 'Message only — the shortest call in the API.',
        run: () => toast.info(text, baseOptions(controls)),
      };
    },
  },
  {
    id: 'loading',
    group: 'Flows',
    label: 'loading → success',
    build: (controls) => {
      const text = textFor(controls, 'Uploading 19 assets…');
      const lines = visualLines(controls, { duration: true });

      return {
        label: 'toast.loading() → update',
        code: `const id = toast.loading(${quote(text)}, {${titleLine(controls, 'Uploading')}${lines}\n});\n\nawait upload();\n\ntoast.update(id, {\n  variant: 'success',\n  message: '19 assets are ready to use.',\n  duration: ${controls.duration},\n});`,
        note: 'Keep the id and morph the same snackbar — no duplicates.',
        run: () => {
          const id = toast.loading(text, {
            ...titleOption(controls, 'Uploading'),
            ...baseOptions(controls),
            duration: null,
          });

          window.setTimeout(() => {
            toast.update(id, {
              variant: 'success',
              ...titleOption(controls, 'Upload complete'),
              message: '19 assets are ready to use.',
              duration: controls.duration,
            });
          }, 1600);
        },
      };
    },
  },
  {
    id: 'promise',
    group: 'Flows',
    label: 'promise',
    build: (controls) => {
      const lines = visualLines(controls);

      return {
        label: 'toast.promise()',
        code: `toast.promise(saveSettings(), {\n  loading: 'Saving…',\n  success: 'Settings saved',\n  error: (error) => error.message,\n}${lines ? `, {${lines}\n}` : ''});`,
        note: 'One call covers loading, success and failure.',
        run: () => {
          void toast
            .promise(
              saveSettings(),
              {
                loading: 'Saving…',
                success: 'Settings saved',
                error: 'Could not save.',
              },
              baseOptions(controls),
            )
            .catch(() => undefined);
        },
      };
    },
  },
  {
    id: 'undo',
    group: 'Flows',
    label: 'action: Undo',
    build: (controls) => {
      const lines = visualLines(controls);

      return {
        label: 'action',
        code: `toast.info('Message archived', {\n  action: {\n    label: 'Undo',\n    onClick: () => toast.success('Restored'),\n  },${lines}\n});`,
        note: 'Handlers may be async: the button shows a pending state.',
        run: () =>
          toast.info('Message archived', {
            ...baseOptions(controls),
            action: {
              label: 'Undo',
              onClick: () => {
                toast.success('Restored');
              },
            },
          }),
      };
    },
  },
  {
    id: 'single',
    group: 'Shapes',
    label: 'single → success',
    build: (controls) => {
      const lines = visualLines(controls, { duration: true, layout: true });

      return {
        label: 'toast.single() → update',
        code: `const id = toast.single('Saving settings…', {\n  variant: 'loading',\n  duration: null,${lines}\n});\n\nawait saveSettings();\n\ntoast.update(id, {\n  variant: 'success',\n  message: 'Settings saved',\n  duration: 3000,\n});`,
        note: 'One line, two states — `layout` does not apply here; the same pill morphs from loading to success.',
        run: () => {
          const id = toast.single('Saving settings…', {
            variant: 'loading',
            position: controls.position,
            animation: controls.animation,
            duration: null,
            dismissible: false,
          });

          void saveSettings().then(() => {
            toast.update(id, {
              variant: 'success',
              message: 'Settings saved',
              duration: 3000,
            });
          });
        },
      };
    },
  },
  {
    id: 'minimize',
    group: 'Stacks',
    label: 'minimize',
    build: (controls) => ({
      label: 'toast.minimize()',
      code: `toast.success('First notification');\ntoast.info('Second notification');\ntoast.warning('Third notification');\n\ntoast.minimize();  // collapse into one pill\ntoast.expand();    // bring them back`,
      note: 'Collapses the visible stack into a summary pill; click it to expand.',
      run: () => {
        toast.success('First notification', baseOptions(controls));
        toast.info('Second notification', baseOptions(controls));
        toast.warning('Third notification', baseOptions(controls));
        toast.minimize();
      },
    }),
  },
  {
    id: 'dismissAll',
    group: 'Stacks',
    label: 'dismissAll',
    build: () => ({
      label: 'toast.dismissAll()',
      code: `toast.dismissAll();`,
      note: 'Clears every visible snackbar at once — watch the event log.',
      run: () => toast.dismissAll(),
    }),
  },
];

const HERO_IDS = ['success', 'error', 'single', 'undo', 'loading', 'promise'];

const REASON_LABELS: Record<SnackbarCloseReason, string> = {
  timeout: 'timed out',
  manual: 'closed',
  action: 'action',
  swipe: 'swiped',
  escape: 'esc',
  dismissAll: 'cleared',
};

/* -------------------------------------------------------------------- page */

export default function ApiHome() {
  return (
    <SnackbarProvider position="bottom-right" duration={5200} theme="light">
      <Docs />
    </SnackbarProvider>
  );
}

function Docs() {
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS);
  const [activeId, setActiveId] = useState(SCENARIOS[0]!.id);

  const run = useCallback(
    (id: string) => {
      const scenario = SCENARIOS.find((item) => item.id === id);
      if (!scenario) return;
      setActiveId(id);
      scenario.build(controls).run();
    },
    [controls],
  );

  const update = <K extends keyof Controls,>(key: K, value: Controls[K]) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  return (
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
            A glassmorphic snackbar system for React. Install it, wrap your app
            once, then call <code>toast</code> from anywhere — no hooks, no
            context plumbing.
          </p>

          <InstallBar command={INSTALL} />

          <div className="quick-try">
            <div className="quick-try__head">
              <span className="quick-try__label">Try it now</span>
              <span className="quick-try__hint">
                Live calls — no setup, no sign-up
              </span>
            </div>
            <div className="quick-try__buttons">
              {HERO_IDS.map((id) => {
                const scenario = SCENARIOS.find((item) => item.id === id)!;
                return (
                  <button
                    key={id}
                    type="button"
                    className="quick-btn"
                    onClick={() => run(id)}
                  >
                    {scenario.label}
                  </button>
                );
              })}
            </div>
            <a className="quick-try__more" href="#playground">
              Open the playground ↓
            </a>
          </div>

          <div className="hero__actions">
            <a className="button button--quiet" href="#start">
              Read the 3-step setup
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
              <CodeBlock code={INSTALL} tone="terminal" />
            </article>

            <article className="step">
              <span className="step__badge">02</span>
              <h3>Mount the provider</h3>
              <p>
                Once, near the root. It renders the notification layer and owns
                the queue.
              </p>
              <CodeBlock code={STEP_MOUNT} />
            </article>

            <article className="step">
              <span className="step__badge">03</span>
              <h3>Call it</h3>
              <p>
                Import <code>toast</code> anywhere — components, stores, fetch
                wrappers, workers.
              </p>
              <CodeBlock code={STEP_CALL} />
            </article>
          </div>
        </section>

        <section className="section" id="playground">
          <header className="section__head">
            <span className="step-index">Playground</span>
            <h2>Tune it, then run it</h2>
            <p className="section__lede">
              Every control on the left feeds the snippet on the right. Click a
              scenario to fire it, tweak an option, then hit Run to repeat it.
            </p>
          </header>

          <Playground
            controls={controls}
            onChange={update}
            activeId={activeId}
            onRun={run}
          />
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
                    Same methods, scoped to the nearest provider. Use it inside
                    React when you want explicit context.
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
                Or scope it to one snackbar with the <code>style</code> prop, or
                switch surface with <code>tone="solid"</code>.
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
          <a href="https://www.npmjs.com/package/react-snackbar-glass">npm</a>
        </nav>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------- playground */

function Playground({
  controls,
  onChange,
  activeId,
  onRun,
}: {
  controls: Controls;
  onChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void;
  activeId: string;
  onRun: (id: string) => void;
}) {
  const active = SCENARIOS.find((item) => item.id === activeId)!;
  const built = active.build(controls);
  const events = useEventLog();

  return (
    <div className="playground">
      <div className="playground__panel">
        <span className="pg-label">Scenario</span>
        <div className="pg-scenarios">
          {groupBy(SCENARIOS, (scenario) => scenario.group).map(
            ([group, items]) => (
              <div className="pg-group" key={group}>
                <span className="pg-group__label">{group}</span>
                <div className="pg-group__buttons">
                  {items.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      className={`chip${
                        scenario.id === activeId ? ' is-active' : ''
                      }`}
                      aria-pressed={scenario.id === activeId}
                      onClick={() => onRun(scenario.id)}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="pg-controls">
          <label className="pg-field pg-field--wide">
            <span className="pg-field__label">Message</span>
            <input
              className="pg-input"
              type="text"
              value={controls.message}
              placeholder="Leave empty for the default text"
              onChange={(event) => onChange('message', event.target.value)}
            />
          </label>

          <div className="pg-field pg-field--wide">
            <span className="pg-field__label">Layout</span>
            <div className="pg-seg" role="group" aria-label="Layout">
              {LAYOUTS.map((layout) => (
                <button
                  key={layout.value}
                  type="button"
                  className={`pg-seg__item${
                    controls.layout === layout.value ? ' is-active' : ''
                  }`}
                  aria-pressed={controls.layout === layout.value}
                  onClick={() => onChange('layout', layout.value)}
                >
                  {layout.label}
                </button>
              ))}
            </div>
          </div>

          <label className="pg-field">
            <span className="pg-field__label">Position</span>
            <select
              className="pg-select"
              value={controls.position}
              onChange={(event) =>
                onChange(
                  'position',
                  event.target.value as SnackbarPosition,
                )
              }
            >
              {POSITIONS.map((position) => (
                <option key={position.value} value={position.value}>
                  {position.label}
                </option>
              ))}
            </select>
          </label>

          <label className="pg-field">
            <span className="pg-field__label">Motion</span>
            <select
              className="pg-select"
              value={controls.animation}
              onChange={(event) =>
                onChange(
                  'animation',
                  event.target.value as SnackbarAnimation,
                )
              }
            >
              {ANIMATIONS.map((animation) => (
                <option key={animation.value} value={animation.value}>
                  {animation.label}
                </option>
              ))}
            </select>
          </label>

          <label className="pg-field">
            <span className="pg-field__label">
              Duration
              <span className="pg-field__value">
                {(controls.duration / 1000).toFixed(1)}s
              </span>
            </span>
            <input
              className="pg-range"
              type="range"
              min={1000}
              max={10000}
              step={200}
              value={controls.duration}
              onChange={(event) =>
                onChange('duration', Number(event.target.value))
              }
            />
          </label>
        </div>
      </div>

      <div className="playground__code">
        <CodeBlock
          code={built.code}
          label={built.label}
          onRun={() => onRun(activeId)}
        />
        <p className="playground__note">{built.note}</p>
        <EventLog events={events} />
      </div>
    </div>
  );
}

function EventLog({ events }: { events: LogEntry[] }) {
  return (
    <div className="pg-log">
      <span className="pg-label">Events</span>
      {events.length === 0 ? (
        <p className="pg-log__empty">
          Run a scenario to watch it open — and close.
        </p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.key}>
              <span
                className="pg-log__dot"
                data-variant={event.variant}
                aria-hidden="true"
              />
              <span className="pg-log__text">{event.text}</span>
              <span className="pg-log__reason" data-kind={event.kind}>
                {event.label}
              </span>
              {event.ms === null ? null : (
                <span className="pg-log__time">
                  {(event.ms / 1000).toFixed(1)}s
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface LogEntry {
  key: string;
  text: string;
  variant: string;
  kind: 'open' | 'close';
  label: string;
  ms: number | null;
}

function logText(record: SnackbarRecord): string {
  if (typeof record.message === 'string' && record.message) {
    return record.message;
  }
  if (typeof record.title === 'string' && record.title) {
    return record.title;
  }
  return 'Snackbar';
}

/**
 * The playground's own account of what happened: every open, and every close
 * with the reason the library reported. Subscribing to the store keeps this
 * honest — nothing here is simulated.
 */
function useEventLog(): LogEntry[] {
  const store = useSnackbarStore();
  const [events, setEvents] = useState<LogEntry[]>([]);
  const opened = useRef(new Set<string>());
  const closed = useRef(new Set<string>());

  useEffect(() => {
    const read = () => {
      const snapshot = store.getSnapshot();
      const fresh: LogEntry[] = [];

      for (const record of snapshot) {
        if (!opened.current.has(record.id)) {
          opened.current.add(record.id);
          fresh.push({
            key: `${record.id}:open`,
            text: logText(record),
            variant: record.variant,
            kind: 'open',
            label: 'opened',
            ms: null,
          });
        }

        if (record.closeReason && !closed.current.has(record.id)) {
          closed.current.add(record.id);
          fresh.push({
            key: `${record.id}:close`,
            text: logText(record),
            variant: record.variant,
            kind: 'close',
            label: REASON_LABELS[record.closeReason],
            ms: Math.max(0, Date.now() - record.createdAt),
          });
        }
      }

      if (fresh.length === 0) return;
      setEvents((current) => [...fresh.reverse(), ...current].slice(0, 5));
    };

    read();
    return store.subscribe(read);
  }, [store]);

  return events;
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
  onRun,
}: {
  code: string;
  label?: string;
  tone?: 'terminal';
  onRun?: () => void;
}) {
  const { copied, copy } = useCopy(code);

  return (
    <div className={`code${tone === 'terminal' ? ' code--terminal' : ''}`}>
      <div className="code__bar">
        <span className="code__label">{label ?? 'tsx'}</span>
        <div className="code__actions">
          {onRun ? (
            <button type="button" className="code__run" onClick={onRun}>
              Run
            </button>
          ) : null}
          <button type="button" className="code__copy" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

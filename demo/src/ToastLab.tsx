import { useEffect, useRef } from 'react';
import { toast } from '../../src';

const SNIPPET = `import { toast } from 'react-snackbar-glass';

toast.success('Draft saved.', { title: 'Saved' });

const id = toast.loading('Uploading 19 assets…');
toast.update(id, { variant: 'success', duration: 3200 });

toast.promise(save(), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Save failed',
});`;

/**
 * Examples for the module-level `toast` API: no hook, no context, no provider
 * wiring — same store, callable from anywhere.
 */
export function ToastLab() {
  const uploadTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (uploadTimer.current !== null) window.clearTimeout(uploadTimer.current);
    },
    [],
  );

  const runLoading = () => {
    const id = toast.loading('Uploading 19 assets…', { title: 'Uploading' });

    if (uploadTimer.current !== null) window.clearTimeout(uploadTimer.current);
    uploadTimer.current = window.setTimeout(() => {
      toast.update(id, {
        variant: 'success',
        title: 'Upload complete',
        message: '19 assets are ready to use.',
        duration: 3200,
      });
    }, 1600);
  };

  const runPromise = () => {
    const task = new Promise<never>((_resolve, reject) => {
      window.setTimeout(() => reject(new Error('402 · card declined')), 1800);
    });

    void toast
      .promise(task, {
        loading: {
          title: 'Charging card',
          message: 'Contacting the payment provider…',
        },
        success: { title: 'Payment captured', message: 'Receipt sent to your inbox.' },
        error: (error) => ({
          title: 'Payment failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          action: { label: 'Try again', onClick: () => runPromise() },
        }),
      })
      .catch(() => undefined);
  };

  const examples: Array<{ label: string; run: () => void }> = [
    {
      label: 'toast.success()',
      run: () =>
        toast.success('Draft saved to your workspace.', { title: 'Saved' }),
    },
    {
      label: 'toast.error()',
      run: () =>
        toast.error('Your card issuer rejected the charge.', {
          title: 'Payment declined',
          action: { label: 'Try again' },
        }),
    },
    {
      label: 'toast.warning()',
      run: () =>
        toast.warning('92% of workspace storage is in use.', {
          title: 'Storage almost full',
        }),
    },
    {
      label: 'toast.info()',
      run: () => toast.info('Build #4821 finished in 42s.'),
    },
    {
      label: 'toast()',
      run: () =>
        toast({
          title: 'Export ready',
          message: '248 rows · 42 KB · ready to download',
          duration: 6000,
        }),
    },
    { label: 'toast.loading() → update', run: runLoading },
    { label: 'toast.promise()', run: runPromise },
    { label: 'toast.dismissAll()', run: () => toast.dismissAll() },
  ];

  return (
    <section className="recipes-section" id="toast-api">
      <header className="section-head">
        <span className="eyebrow">Toast API</span>
        <h2>Same API, no hook.</h2>
        <p>
          <code>toast</code> talks to the shared store, so API clients, workers
          and plain modules can raise notifications without a provider hook.
        </p>
      </header>

      <div className="toast-lab">
        <div className="snippet-card">
          <div className="snippet-card__bar">
            <span className="chrome-dots chrome-dots--small">
              <span />
              <span />
              <span />
            </span>
            <span>notify.ts</span>
            <span className="snippet-card__tag">global</span>
          </div>
          <pre className="snippet">
            <code>{SNIPPET}</code>
          </pre>
        </div>

        <div className="toast-lab__panel">
          <div className="toast-lab__buttons">
            {examples.map((example) => (
              <button
                key={example.label}
                type="button"
                className="button button--small button--ghost toast-lab__button"
                onClick={example.run}
              >
                {example.label}
              </button>
            ))}
          </div>
          <p className="toast-lab__hint">
            Every button fires a real <code>toast.*</code> call — it lands in the
            corner queue and respects your theme, tone and position settings.
          </p>
        </div>
      </div>
    </section>
  );
}

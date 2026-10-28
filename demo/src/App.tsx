import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  SnackbarProvider,
  toast,
  useSnackbar,
} from '../../src';
import type {
  SnackbarAnimation,
  SnackbarLayout,
  SnackbarOptions,
  SnackbarPosition,
  SnackbarSize,
  SnackbarTheme,
  SnackbarTone,
  SnackbarVariant,
} from '../../src';
import { ToastLab } from './ToastLab';

/* ------------------------------------------------------------------ config */

interface Config {
  position: SnackbarPosition;
  tone: SnackbarTone;
  size: SnackbarSize;
  theme: SnackbarTheme;
  layout: SnackbarLayout;
  animation: SnackbarAnimation;
  duration: number;
  maxVisible: number;
  pauseOnHover: boolean;
  swipeToDismiss: boolean;
  progress: boolean;
}

const DEFAULT_CONFIG: Config = {
  position: 'bottom-right',
  tone: 'glass',
  size: 'md',
  theme: 'light',
  layout: 'card',
  animation: 'slide',
  duration: 5200,
  maxVisible: 3,
  pauseOnHover: true,
  swipeToDismiss: true,
  progress: true,
};

const INSTALL_COMMAND = 'npm install react-snackbar-glass';

const POSITIONS: SnackbarPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const POSITION_LABELS: Record<SnackbarPosition, string> = {
  'top-left': 'Top left',
  'top-center': 'Top center',
  'top-right': 'Top right',
  'bottom-left': 'Bottom left',
  'bottom-center': 'Bottom center',
  'bottom-right': 'Bottom right',
};

const VARIANTS: SnackbarVariant[] = [
  'neutral',
  'success',
  'error',
  'warning',
  'info',
  'loading',
  'custom',
];

const VARIANT_LABELS: Record<SnackbarVariant, string> = {
  neutral: 'Neutral',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  loading: 'Loading',
  custom: 'Custom',
};

const SAMPLES: Record<
  SnackbarVariant,
  { title?: string; message: string; action?: string }
> = {
  neutral: { message: 'Link copied to your clipboard.' },
  success: {
    title: 'Deployment complete',
    message: 'v1.4.0 is live in production.',
    action: 'View build',
  },
  error: {
    title: 'Payment declined',
    message: 'Your card issuer rejected the charge.',
    action: 'Try again',
  },
  warning: {
    title: 'Storage almost full',
    message: '92% of workspace storage is in use.',
  },
  info: {
    title: 'New version available',
    message: 'Reload to pick up the latest improvements.',
    action: 'Reload',
  },
  loading: {
    title: 'Preparing export',
    message: 'Compiling 248 rows into a CSV…',
  },
  custom: {
    title: 'Saved to collection',
    message: 'Added to “Design inspiration”.',
    action: 'Undo',
  },
};

const CUSTOM_STYLE = {
  '--prs-accent': '#f472b6',
  '--prs-solid': '#be185d',
} as CSSProperties;

/* ------------------------------------------------------------------- icons */

type IconProps = { size?: number };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function CheckIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path {...stroke} d="M4.8 10.4 8.1 13.7l7.1-7.3" strokeWidth={2} />
    </svg>
  );
}

function CloseIcon({ size = 13 }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
      <path
        {...stroke}
        strokeWidth={1.6}
        d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"
      />
    </svg>
  );
}

function AlertIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <circle {...stroke} cx="10" cy="10" r="6.6" />
      <path {...stroke} d="M10 6.4v4.2" />
      <circle cx="10" cy="13.5" r="0.95" fill="currentColor" />
    </svg>
  );
}

function WarningIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path
        {...stroke}
        d="M8.6 3.6a1.6 1.6 0 0 1 2.8 0l5.2 9.6a1.6 1.6 0 0 1-1.4 2.4H4.8a1.6 1.6 0 0 1-1.4-2.4l5.2-9.6Z"
      />
      <path {...stroke} d="M10 7.6v3.2" />
      <circle cx="10" cy="13.3" r="0.95" fill="currentColor" />
    </svg>
  );
}

function InfoIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <circle {...stroke} cx="10" cy="10" r="6.6" />
      <path {...stroke} d="M10 9.1v4.2" />
      <circle cx="10" cy="6.5" r="0.95" fill="currentColor" />
    </svg>
  );
}

function BellIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path
        {...stroke}
        d="M5.2 8.1a4.8 4.8 0 0 1 9.6 0c0 3.1 1.3 4.3 1.3 4.3H3.9s1.3-1.2 1.3-4.3Z"
      />
      <path {...stroke} d="M8.2 15.2a1.9 1.9 0 0 0 3.6 0" />
    </svg>
  );
}

function SparkIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path
        {...stroke}
        d="M10 2.9c.55 3.9 2.2 5.55 6.1 6.1-3.9.55-5.55 2.2-6.1 6.1-.55-3.9-2.2-5.55-6.1-6.1C7.8 8.45 9.45 6.8 10 2.9Z"
      />
      <path {...stroke} d="M15.2 13.4c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2Z" />
    </svg>
  );
}

function SpinnerIcon({ size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      className="spin"
    >
      <circle
        {...stroke}
        cx="10"
        cy="10"
        r="6.4"
        opacity="0.22"
        strokeWidth={2}
      />
      <path
        {...stroke}
        d="M10 3.6a6.4 6.4 0 0 1 6.4 6.4"
        strokeWidth={2}
      />
    </svg>
  );
}

function SunIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <circle {...stroke} cx="10" cy="10" r="3.4" />
      <path
        {...stroke}
        d="M10 2.6v1.6M10 15.8v1.6M2.6 10h1.6M15.8 10h1.6M4.8 4.8l1.1 1.1M14.1 14.1l1.1 1.1M15.2 4.8l-1.1 1.1M5.9 14.1l-1.1 1.1"
      />
    </svg>
  );
}

function MoonIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path
        {...stroke}
        d="M16.2 12.3A6.7 6.7 0 0 1 7.7 3.8a6.7 6.7 0 1 0 8.5 8.5Z"
      />
    </svg>
  );
}

function MonitorIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <rect {...stroke} x="2.8" y="4" width="14.4" height="9.6" rx="1.6" />
      <path {...stroke} d="M7.2 16.4h5.6M10 13.6v2.8" />
    </svg>
  );
}

function ArrowIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path {...stroke} d="M4 10h11.4M11 5.6l4.4 4.4-4.4 4.4" />
    </svg>
  );
}

function CopyIcon({ size = 15 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <rect {...stroke} x="7" y="7" width="9" height="9" rx="2" />
      <path {...stroke} d="M13 7V5.8A1.8 1.8 0 0 0 11.2 4H5.8A1.8 1.8 0 0 0 4 5.8v5.4A1.8 1.8 0 0 0 5.8 13H7" />
    </svg>
  );
}

function TerminalIcon({ size = 15 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <rect {...stroke} x="2.6" y="3.8" width="14.8" height="12.4" rx="2.2" />
      <path {...stroke} d="m6.4 8.2 2 1.8-2 1.8M10.8 12h3" />
    </svg>
  );
}

function UndoIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path {...stroke} d="M7.2 6.2 3.8 9.6l3.4 3.4" />
      <path {...stroke} d="M4.2 9.6h7.1a4.3 4.3 0 0 1 0 8.6" />
    </svg>
  );
}

function UploadIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path {...stroke} d="M10 13.2V3.9M6.4 7.3 10 3.7l3.6 3.6" />
      <path {...stroke} d="M3.8 12.4v2.4a1.8 1.8 0 0 0 1.8 1.8h8.8a1.8 1.8 0 0 0 1.8-1.8v-2.4" />
    </svg>
  );
}

function LayersIcon({ size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path {...stroke} d="m10 2.8 7 3.6-7 3.6-7-3.6 7-3.6Z" />
      <path {...stroke} d="m3 10.4 7 3.6 7-3.6M3 13.8l7 3.5 7-3.5" />
    </svg>
  );
}

function SwipeIcon({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path {...stroke} d="M3.5 10h9M9.2 6.7 12.5 10l-3.3 3.3" />
      <path {...stroke} d="M14.2 5.5c1.1 1.2 1.7 2.7 1.7 4.5s-.6 3.3-1.7 4.5" />
    </svg>
  );
}

function PauseIcon({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <rect {...stroke} x="4.4" y="4" width="3.4" height="12" rx="1.2" />
      <rect {...stroke} x="12.2" y="4" width="3.4" height="12" rx="1.2" />
    </svg>
  );
}

function ShieldIcon({ size = 14 }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
      <path
        {...stroke}
        d="M10 2.8 16 5v4.1c0 3.5-2.3 6.5-6 8.1-3.7-1.6-6-4.6-6-8.1V5l6-2.2Z"
      />
      <path {...stroke} d="m7.5 9.7 1.8 1.8 3.3-3.4" />
    </svg>
  );
}

function VariantGlyph({
  variant,
  size = 16,
}: {
  variant: SnackbarVariant;
  size?: number;
}) {
  switch (variant) {
    case 'success':
      return <CheckIcon size={size} />;
    case 'error':
      return <AlertIcon size={size} />;
    case 'warning':
      return <WarningIcon size={size} />;
    case 'info':
      return <InfoIcon size={size} />;
    case 'loading':
      return <SpinnerIcon size={size} />;
    case 'custom':
      return <SparkIcon size={size} />;
    default:
      return <BellIcon size={size} />;
  }
}

/* ------------------------------------------------------------- primitives */

function MockToast({
  variant,
  tone,
  size = 'md',
  title,
  message,
  action,
  duration = 6000,
  showProgress = true,
  className = '',
}: {
  variant: SnackbarVariant;
  tone: SnackbarTone;
  size?: SnackbarSize;
  title?: string;
  message: string;
  action?: string;
  duration?: number;
  showProgress?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mock ${className}`.trim()}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      aria-hidden="true"
    >
      <span className="mock__icon">
        <VariantGlyph variant={variant} size={17} />
      </span>
      <span className="mock__content">
        {title ? <span className="mock__title">{title}</span> : null}
        <span className="mock__message">{message}</span>
        {action ? (
          <span className="mock__actions">
            <span className="mock__action">{action}</span>
          </span>
        ) : null}
      </span>
      <span className="mock__close">
        <CloseIcon size={12} />
      </span>
      {showProgress ? (
        <span className="mock__progress">
          <span style={{ animationDuration: `${duration}ms` }} />
        </span>
      ) : null}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch-row"
      onClick={() => onChange(!checked)}
    >
      <span className="switch-row__copy">
        <span>{label}</span>
        <small>{description}</small>
      </span>
      <span className={`switch ${checked ? 'is-on' : ''}`} aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? 'is-active' : ''}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ThemeButton({
  theme,
  onCycle,
}: {
  theme: SnackbarTheme;
  onCycle: () => void;
}) {
  return (
    <button
      type="button"
      className="icon-button"
      onClick={onCycle}
      aria-label={`Theme: ${theme}. Change theme.`}
      title={`Theme: ${theme}`}
    >
      {theme === 'dark' ? (
        <SunIcon />
      ) : theme === 'light' ? (
        <MoonIcon />
      ) : (
        <MonitorIcon />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------- app */

export default function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  useEffect(() => {
    document.documentElement.dataset.theme = config.theme;
  }, [config.theme]);

  const cycleTheme = () => {
    setConfig((current) => ({
      ...current,
      theme:
        current.theme === 'dark'
          ? 'light'
          : current.theme === 'light'
            ? 'auto'
            : 'dark',
    }));
  };

  return (
    <div className="page" data-theme={config.theme}>
      <div className="page__aurora page__aurora--violet" aria-hidden="true" />
      <div className="page__aurora page__aurora--cyan" aria-hidden="true" />
      <div className="page__grid" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Glass Snackbar home">
          <span className="brand__mark">
            <SparkIcon size={19} />
          </span>
          <span className="brand__name">
            Glass <span>Snackbar</span>
          </span>
          <span className="brand__version">1.0</span>
        </a>

        <nav className="topbar__nav" aria-label="Sections">
          <a href="#studio">Studio</a>
          <a href="#recipes">Recipes</a>
          <a href="#toast-api">Toast API</a>
          <a href="#install">Install</a>
        </nav>

        <div className="topbar__actions">
          <ThemeButton theme={config.theme} onCycle={cycleTheme} />
          <a className="topbar__install" href="#install">
            Install <ArrowIcon size={14} />
          </a>
        </div>
      </header>

      <SnackbarProvider
        position={config.position}
        duration={config.duration}
        tone={config.tone}
        size={config.size}
        layout={config.layout}
        animation={config.animation}
        theme={config.theme}
        maxVisible={config.maxVisible}
        pauseOnHover={config.pauseOnHover}
        pauseOnFocus
        pauseOnDocumentHidden
        swipeToDismiss={config.swipeToDismiss}
        progress={config.progress}
      >
        <Showcase config={config} setConfig={setConfig} />
      </SnackbarProvider>
    </div>
  );
}

/* --------------------------------------------------------------- showcase */

function Showcase({
  config,
  setConfig,
}: {
  config: Config;
  setConfig: Dispatch<SetStateAction<Config>>;
}) {
  const api = useSnackbar();
  const [preview, setPreview] = useState<SnackbarVariant>('success');
  const [deploying, setDeploying] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      api.success('Welcome to the live demo.', {
        title: 'Glass Snackbar',
        duration: 6000,
        action: { label: 'Nice' },
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [api]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) window.clearTimeout(timer);
    };
  }, []);

  const later = (run: () => void, delay: number) => {
    const timer = window.setTimeout(run, delay);
    timers.current.push(timer);
  };

  const handleAction = (variant: SnackbarVariant) => {
    switch (variant) {
      case 'success':
        api.info('Build #4821 opened in a new tab.');
        break;
      case 'error':
        api.info('Starting a fresh checkout session…');
        break;
      case 'info':
        api.success('Reloaded to the latest version.', {
          title: 'You are up to date',
        });
        break;
      case 'custom':
        api.info('Removed from “Design inspiration”.');
        break;
      default:
        break;
    }
  };

  const startExport = () => {
    setPreview('loading');
    const id = 'demo-export';
    api.show({
      id,
      variant: 'loading',
      title: 'Preparing export',
      message: 'Compiling 248 rows into a CSV…',
      duration: null,
      progress: false,
    });
    later(() => {
      api.update(id, {
        variant: 'success',
        title: 'Export ready',
        message: '248 rows · 42 KB · ready to download',
        duration: 4200,
        action: { label: 'Download' },
      });
    }, 2400);
  };

  const showVariant = (variant: SnackbarVariant) => {
    setPreview(variant);
    if (variant === 'loading') {
      startExport();
      return;
    }

    const sample = SAMPLES[variant];
    const options: SnackbarOptions = {
      title: sample.title,
      message: sample.message,
      action: sample.action
        ? { label: sample.action, onClick: () => handleAction(variant) }
        : undefined,
      ...(variant === 'custom' ? { style: CUSTOM_STYLE } : {}),
    };

    api.show({ ...options, variant });
  };

  const showAll = () => {
    const burst: SnackbarVariant[] = [
      'success',
      'info',
      'warning',
      'error',
      'neutral',
    ];
    burst.forEach((variant, index) => {
      later(() => showVariant(variant), index * 180);
    });
  };

  const deploy = (fail: boolean) => {
    if (deploying) return;
    setDeploying(true);

    const pending = new Promise<void>((resolve, reject) => {
      later(() => {
        if (fail) {
          reject(new Error('Migration 0042 failed. Rollback initiated.'));
        } else {
          resolve();
        }
      }, 1900);
    });

    const task = api.promise(
      pending,
      {
        loading: {
          title: 'Deploying build',
          message: 'Uploading assets and running migrations…',
        },
        success: {
          title: 'Deployment complete',
          message: 'Build #4821 is live in production.',
          action: {
            label: 'Open build',
            onClick: () => {
              api.info('Build #4821 opened.');
            },
          },
        },
        error: (error) => ({
          title: 'Deployment failed',
          message:
            error instanceof Error ? error.message : 'Something went wrong.',
          action: {
            label: 'View logs',
            onClick: () => {
              api.info('Opening build logs…');
            },
          },
        }),
      },
      { id: 'demo-deploy', duration: 5200 },
    );

    task.then(
      () => setDeploying(false),
      () => setDeploying(false),
    );
  };

  const archive = () => {
    api.show({
      title: 'Project archived',
      message: '“Landing page v2” moved to the archive.',
      duration: 7000,
      action: {
        label: 'Undo',
        onClick: () => {
          api.success('Project restored.', {
            title: 'Back in your workspace',
          });
        },
      },
    });
  };

  const uploadAssets = () => {
    const id = 'demo-upload';
    api.show({
      id,
      variant: 'loading',
      title: 'Uploading brand assets',
      message: '42% · 8 of 19 files',
      duration: null,
    });
    later(() => {
      api.update(id, {
        variant: 'success',
        title: 'Upload complete',
        message: '19 assets are ready to use.',
        duration: 4200,
      });
    }, 2200);
  };

  const stageSample = SAMPLES[preview];
  const stageKey = `${preview}-${config.tone}-${config.size}-${config.position}-${config.duration}`;

  const set = <K extends keyof Config,>(key: K, value: Config[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

    return (
    <main id="top">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">
            <span className="eyebrow__dot" />
            React 18 + 19 · zero runtime dependencies
          </span>
          <h1>
            Notifications
            <br />
            that <span className="display-italic">feel designed.</span>
          </h1>
          <p className="hero__lede">
            A glassmorphic snackbar system with spring motion, promise-aware
            states, swipe dismissal and a token-driven core. Drop it in, then
            make it unmistakably yours.
          </p>

          <div className="hero__actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => showVariant('success')}
            >
              Try it live <ArrowIcon size={15} />
            </button>
            <a className="button button--ghost" href="#studio">
              Explore the studio
            </a>
          </div>

          <ul className="hero__features">
            <li>
              <CheckIcon size={14} /> 6 placements
            </li>
            <li>
              <CheckIcon size={14} /> Promise aware
            </li>
            <li>
              <CheckIcon size={14} /> Swipe to dismiss
            </li>
            <li>
              <CheckIcon size={14} /> WCAG live regions
            </li>
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="preview">
            <div className="preview__halo" />
            <div className="preview__frame">
              <div className="preview__chrome">
                <span className="chrome-dots">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="preview__address">
                  acme.studio/dashboard
                </span>
                <span className="preview__secure">
                  <ShieldIcon size={11} />
                </span>
              </div>

              <div className="preview__window">
                <aside className="preview__rail">
                  <span className="rail__logo">
                    <SparkIcon size={13} />
                  </span>
                  <span className="rail__item is-active" />
                  <span className="rail__item" />
                  <span className="rail__item" />
                  <span className="rail__item" />
                  <span className="rail__avatar" />
                </aside>

                <div className="preview__canvas">
                  <div className="preview__topline">
                    <span>
                      <small>Overview</small>
                      <strong>Good morning, Ada</strong>
                    </span>
                    <span className="preview__avatar">A</span>
                  </div>

                  <div className="preview__stats">
                    <div className="stat">
                      <small>Revenue</small>
                      <strong>€24.8k</strong>
                      <span className="stat__delta">+18.2%</span>
                    </div>
                    <div className="stat">
                      <small>Active projects</small>
                      <strong>12</strong>
                      <span className="stat__delta stat__delta--muted">
                        3 due soon
                      </span>
                    </div>
                  </div>

                  <div className="preview__chart">
                    <span style={{ height: '38%' }} />
                    <span style={{ height: '58%' }} />
                    <span style={{ height: '46%' }} />
                    <span style={{ height: '72%' }} />
                    <span style={{ height: '64%' }} />
                    <span style={{ height: '88%' }} />
                    <span style={{ height: '76%' }} />
                  </div>

                  <MockToast
                    className="preview__toast preview__toast--behind"
                    variant="info"
                    tone="glass"
                    title="New comment"
                    message="“Love the new palette.” — Mia"
                    duration={9000}
                  />
                  <MockToast
                    className="preview__toast preview__toast--main"
                    variant="success"
                    tone="glass"
                    title="Payment received"
                    message="€1,240.00 from Acme Studio"
                    action="View"
                    duration={6500}
                  />
                </div>
              </div>
            </div>

            <span className="preview__badge preview__badge--motion">
              <span className="pulse-dot" /> Spring motion
            </span>
            <span className="preview__badge preview__badge--a11y">
              <ShieldIcon size={12} /> WCAG 2.2
            </span>
          </div>
        </div>
      </section>

      <section className="studio" id="studio">
        <header className="studio__head">
          <div>
            <span className="eyebrow">Live studio</span>
            <h2>Tune the feel. Trigger the real thing.</h2>
            <p>
              Every control below updates the actual provider. Fire a snackbar
              and watch it land exactly where you chose.
            </p>
          </div>
          <div className="studio__head-actions">
            <button
              type="button"
              className="button button--ghost button--small"
              onClick={() => api.dismissAll()}
            >
              Clear all
            </button>
            <button
              type="button"
              className="button button--primary button--small"
              onClick={showAll}
            >
              <LayersIcon size={15} /> Show all
            </button>
          </div>
        </header>

        <div className="studio__grid">
          <aside className="controls" aria-label="Snackbar controls">
            <div className="control">
              <span className="control__label">Notify</span>
              <div className="variant-grid">
                {VARIANTS.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    className={`variant-button ${
                      preview === variant ? 'is-active' : ''
                    }`}
                    data-variant={variant}
                    onClick={() => showVariant(variant)}
                  >
                    <span className="variant-button__dot" />
                    {VARIANT_LABELS[variant]}
                  </button>
                ))}
              </div>
            </div>

            <div className="control">
              <span className="control__label">Placement</span>
              <div className="position-grid" role="group" aria-label="Placement">
                {POSITIONS.map((position) => (
                  <button
                    key={position}
                    type="button"
                    className={`position-button ${
                      config.position === position ? 'is-active' : ''
                    }`}
                    aria-label={POSITION_LABELS[position]}
                    aria-pressed={config.position === position}
                    title={POSITION_LABELS[position]}
                    onClick={() => {
                      set('position', position);
                      toast.single(`Position set to ${position}`, {
                        variant: 'success',
                        duration: 2400,
                        position,
                      });
                    }}
                  >
                    <span className="position-button__screen">
                      <span
                        className={`position-button__dot position-button__dot--${position}`}
                      />
                    </span>
                  </button>
                ))}
              </div>
              <span className="control__hint">
                {POSITION_LABELS[config.position]} · applies to new snackbars
              </span>
            </div>

            <div className="control">
              <span className="control__label">Surface</span>
              <Segmented
                label="Surface tone"
                value={config.tone}
                onChange={(tone) => set('tone', tone)}
                options={[
                  { value: 'glass', label: 'Glass' },
                  { value: 'solid', label: 'Solid' },
                ]}
              />
              <Segmented
                label="Theme"
                value={config.theme}
                onChange={(theme) => set('theme', theme)}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
              />
              <Segmented
                label="Snackbar size"
                value={config.size}
                onChange={(size) => set('size', size)}
                options={[
                  { value: 'xs', label: 'XS' },
                  { value: 'sm', label: 'S' },
                  { value: 'md', label: 'M' },
                  { value: 'lg', label: 'L' },
                ]}
              />
            </div>

            <div className="control">
              <span className="control__label">Layout</span>
              <Segmented
                label="Snackbar layout"
                value={config.layout}
                onChange={(layout) => set('layout', layout)}
                options={[
                  { value: 'card', label: 'Card' },
                  { value: 'compact', label: 'Compact' },
                  { value: 'inline', label: 'Single line' },
                ]}
              />
              <span className="control__hint">
                <code>layout</code> · card, compact or inline
              </span>
            </div>

            <div className="control">
              <span className="control__label">Motion</span>
              <Segmented
                label="Enter and exit animation"
                value={config.animation}
                onChange={(animation) => set('animation', animation)}
                options={[
                  { value: 'slide', label: 'Slide' },
                  { value: 'fade', label: 'Fade' },
                  { value: 'scale', label: 'Scale' },
                  { value: 'pop', label: 'Pop' },
                  { value: 'flip', label: 'Flip' },
                  { value: 'none', label: 'None' },
                ]}
              />
              <span className="control__hint">
                <code>animation</code> · new snackbars animate with this preset
              </span>
            </div>

            <div className="control">
              <div className="control__row">
                <span className="control__label">Duration</span>
                <span className="control__value">
                  {(config.duration / 1000).toFixed(1)}s
                </span>
              </div>
              <input
                className="range"
                type="range"
                min={2000}
                max={10000}
                step={200}
                value={config.duration}
                aria-label="Default duration in milliseconds"
                onChange={(event) =>
                  set('duration', Number(event.target.value))
                }
              />

              <div className="control__row">
                <span className="control__label">Max stack</span>
                <span className="control__value">{config.maxVisible}</span>
              </div>
              <input
                className="range"
                type="range"
                min={1}
                max={5}
                step={1}
                value={config.maxVisible}
                aria-label="Maximum visible snackbars"
                onChange={(event) =>
                  set('maxVisible', Number(event.target.value))
                }
              />
            </div>

            <div className="control control--switches">
              <Switch
                checked={config.pauseOnHover}
                onChange={(value) => set('pauseOnHover', value)}
                label="Pause on hover"
                description="The countdown freezes while reading."
              />
              <Switch
                checked={config.swipeToDismiss}
                onChange={(value) => set('swipeToDismiss', value)}
                label="Swipe to dismiss"
                description="Flick a card away on touch or trackpad."
              />
              <Switch
                checked={config.progress}
                onChange={(value) => set('progress', value)}
                label="Countdown hairline"
                description="Show the remaining time at the bottom."
              />
            </div>
          </aside>

          <div className="stage-column">
            <div className="stage">
              <div className="stage__bar">
                <span className="stage__live">
                  <span className="pulse-dot" /> Live preview
                </span>
                <span className="stage__coords">
                  {POSITION_LABELS[config.position]} · {config.tone} ·{' '}
                  {config.size}
                </span>
              </div>

              <div className="stage__canvas">
                <div className="stage__wash stage__wash--a" />
                <div className="stage__wash stage__wash--b" />
                <div className="stage__wire" />

                <MockToast
                  key={stageKey}
                  className={`mock--stage mock--${config.position}`}
                  variant={preview}
                  tone={config.tone}
                  size={config.size}
                  title={stageSample.title}
                  message={stageSample.message}
                  action={stageSample.action}
                  duration={config.duration}
                  showProgress={config.progress && preview !== 'loading'}
                />

                <span className="stage__hint">
                  <PauseIcon size={12} /> hover to pause
                  <span className="stage__hint-sep">/</span>
                  <SwipeIcon size={12} /> drag to dismiss
                </span>
              </div>

              <div className="stage__footer">
                <span>
                  <ShieldIcon size={13} /> Polite & assertive live regions
                </span>
                <span>
                  <SparkIcon size={13} /> Spring entrance, 190ms exit
                </span>
                <span>
                  <LayersIcon size={13} /> Queue with FLIP stacking
                </span>
              </div>
            </div>

            <div className="snippet-card">
              <div className="snippet-card__bar">
                <span className="chrome-dots chrome-dots--small">
                  <span />
                  <span />
                  <span />
                </span>
                <span>usage.tsx</span>
                <span className="snippet-card__tag">typed</span>
              </div>
              <pre className="snippet">
                <code>
                  <span className="tok-comment">
                    {'// global API — no hook, no context'}
                  </span>
                  {'\n'}
                  <span className="tok-kw">import</span>{' '}
                  <span className="tok-op">{'{ toast }'}</span>{' '}
                  <span className="tok-kw">from</span>{' '}
                  <span className="tok-str">'react-snackbar-glass'</span>
                  <span className="tok-op">;</span>
                  {'\n\n'}
                  <span className="tok-var">toast</span>
                  <span className="tok-op">.</span>
                  <span className="tok-fn">success</span>
                  <span className="tok-op">(</span>
                  <span className="tok-str">'Deployment complete.'</span>
                  <span className="tok-op">{', {'}</span>
                  {'\n  '}
                  <span className="tok-prop">title</span>
                  <span className="tok-op">:</span>{' '}
                  <span className="tok-str">'v1.4.0 is live'</span>
                  <span className="tok-op">,</span>
                  {'\n  '}
                  <span className="tok-prop">duration</span>
                  <span className="tok-op">:</span>{' '}
                  <span className="tok-num">{config.duration}</span>
                  <span className="tok-op">,</span>
                  {'\n  '}
                  <span className="tok-prop">tone</span>
                  <span className="tok-op">:</span>{' '}
                  <span className="tok-str">'{config.tone}'</span>
                  <span className="tok-op">,</span>
                  {'\n  '}
                  <span className="tok-prop">size</span>
                  <span className="tok-op">:</span>{' '}
                  <span className="tok-str">'{config.size}'</span>
                  <span className="tok-op">,</span>
                  {'\n  '}
                  <span className="tok-prop">action</span>
                  <span className="tok-op">: {'{ label: '}</span>
                  <span className="tok-str">'View build'</span>
                  <span className="tok-op">{' }'}</span>
                  {'\n'}
                  <span className="tok-op">{'});'}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="recipes-section" id="recipes">
        <header className="section-head">
          <span className="eyebrow">Recipes</span>
          <h2>Small API. Serious UX.</h2>
          <p>
            The primitives you reach for every day, already wired with sensible
            defaults and graceful failure states.
          </p>
        </header>

        <div className="recipes">
          <article className="recipe">
            <span className="recipe__icon recipe__icon--violet">
              <ArrowIcon size={17} />
            </span>
            <h3>Promise aware</h3>
            <p>
              One call moves a snackbar through loading, success and error —
              without losing the deployment id or the action.
            </p>
            <code className="recipe__code">toast.promise(task, ...)</code>
            <div className="recipe__actions">
              <button
                type="button"
                className="button button--small button--primary"
                onClick={() => deploy(false)}
                disabled={deploying}
              >
                {deploying ? 'Deploying…' : 'Run deploy'}
              </button>
              <button
                type="button"
                className="button button--small button--ghost"
                onClick={() => deploy(true)}
                disabled={deploying}
              >
                Simulate failure
              </button>
            </div>
          </article>

          <article className="recipe">
            <span className="recipe__icon recipe__icon--amber">
              <UndoIcon size={17} />
            </span>
            <h3>Undo window</h3>
            <p>
              Give destructive actions a seven-second safety net. The action
              pill is keyboard reachable and closes with a reason.
            </p>
            <code className="recipe__code">action: {'{ label: "Undo" }'}</code>
            <div className="recipe__actions">
              <button
                type="button"
                className="button button--small button--ghost"
                onClick={archive}
              >
                Archive project
              </button>
            </div>
          </article>

          <article className="recipe">
            <span className="recipe__icon recipe__icon--cyan">
              <UploadIcon size={17} />
            </span>
            <h3>Sticky updates</h3>
            <p>
              Keep a persistent loading card open, then update it in place.
              Timers restart automatically when the duration changes.
            </p>
            <code className="recipe__code">toast.update(id, {'{...}'})</code>
            <div className="recipe__actions">
              <button
                type="button"
                className="button button--small button--ghost"
                onClick={uploadAssets}
              >
                Upload 19 assets
              </button>
            </div>
          </article>
        </div>
      </section>

      <ToastLab />

      <section className="install" id="install">
        <div className="install__copy-box">
          <span className="eyebrow">Install</span>
          <h2>One command. Zero dependencies.</h2>
          <p>
            React 18 and 19, TypeScript first, SSR safe. Styles ship with the
            package — no CSS-in-JS runtime, no configuration.
          </p>
          <div className="install__meta">
            <span>
              <CheckIcon size={13} /> Tree-shakeable
            </span>
            <span>
              <CheckIcon size={13} /> Types included
            </span>
            <span>
              <CheckIcon size={13} /> MIT licensed
            </span>
          </div>
        </div>

        <InstallCard />
      </section>

      <footer className="footer">
        <span className="brand brand--footer">
          <span className="brand__mark">
            <SparkIcon size={15} />
          </span>
          <span className="brand__name">
            Glass <span>Snackbar</span>
          </span>
        </span>
        <p>Designed for the 420 milliseconds people actually notice.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}

function InstallCard() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      // Clipboard access can be blocked in iframes; still show feedback.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="install__box">
      <div className="install__bar">
        <span>
          <TerminalIcon /> terminal
        </span>
        <span className="install__badge">npm</span>
      </div>
      <div className="install__command">
        <span className="install__prompt">$</span>
        <code>{INSTALL_COMMAND}</code>
        <button
          type="button"
          className="install__copy"
          onClick={copy}
          aria-label="Copy install command"
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="install__foot">
        <span>TypeScript</span>
        <span>ESM + CJS</span>
        <span>SSR safe</span>
      </div>
    </div>
  );
}

export type { Config };

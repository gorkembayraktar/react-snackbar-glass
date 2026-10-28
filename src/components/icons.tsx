import type { ReactNode } from 'react';
import type { SnackbarVariant } from '../types';

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const BellIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      {...strokeProps}
      d="M5.2 8.1a4.8 4.8 0 0 1 9.6 0c0 3.1 1.3 4.3 1.3 4.3H3.9s1.3-1.2 1.3-4.3Z"
    />
    <path {...strokeProps} d="M8.2 15.2a1.9 1.9 0 0 0 3.6 0" />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path {...strokeProps} d="M4.6 10.4 8 13.8l7.4-7.6" strokeWidth={2} />
  </svg>
);

const ErrorIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <circle {...strokeProps} cx="10" cy="10" r="6.6" />
    <path {...strokeProps} d="M10 6.4v4.2" />
    <circle cx="10" cy="13.5" r="0.95" fill="currentColor" />
  </svg>
);

const WarningIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      {...strokeProps}
      d="M8.6 3.6a1.6 1.6 0 0 1 2.8 0l5.2 9.6a1.6 1.6 0 0 1-1.4 2.4H4.8a1.6 1.6 0 0 1-1.4-2.4l5.2-9.6Z"
    />
    <path {...strokeProps} d="M10 7.6v3.2" />
    <circle cx="10" cy="13.3" r="0.95" fill="currentColor" />
  </svg>
);

const InfoIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <circle {...strokeProps} cx="10" cy="10" r="6.6" />
    <path {...strokeProps} d="M10 9.1v4.2" />
    <circle cx="10" cy="6.5" r="0.95" fill="currentColor" />
  </svg>
);

const SpinnerIcon = (
  <svg
    viewBox="0 0 20 20"
    width="18"
    height="18"
    aria-hidden="true"
    className="prs-icon-spin"
  >
    <circle
      {...strokeProps}
      cx="10"
      cy="10"
      r="6.4"
      opacity="0.22"
      strokeWidth={2}
    />
    <path
      {...strokeProps}
      d="M10 3.6a6.4 6.4 0 0 1 6.4 6.4"
      strokeWidth={2}
    />
  </svg>
);

const SparkIcon = (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
    <path
      {...strokeProps}
      d="M10 2.9c.55 3.9 2.2 5.55 6.1 6.1-3.9.55-5.55 2.2-6.1 6.1-.55-3.9-2.2-5.55-6.1-6.1C7.8 8.45 9.45 6.8 10 2.9Z"
    />
    <path {...strokeProps} d="M15.2 13.4c.2 1.4.8 2 2.2 2.2-1.4.2-2 .8-2.2 2.2-.2-1.4-.8-2-2.2-2.2 1.4-.2 2-.8 2.2-2.2Z" />
  </svg>
);

export const defaultIcons: Record<SnackbarVariant, ReactNode> = {
  neutral: BellIcon,
  success: CheckIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  loading: SpinnerIcon,
  custom: SparkIcon,
};

export const DefaultCloseIcon = (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"
    />
  </svg>
);

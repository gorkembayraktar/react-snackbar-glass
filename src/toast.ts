import { isValidElement, type ReactNode } from 'react';
import { getDefaultStore } from './core/defaultStore';
import type {
  SnackbarCloseReason,
  SnackbarOptions,
  SnackbarPromiseOptions,
  SnackbarVariant,
  ToastApi,
  ToastPresetOptions,
} from './types';

/** Same shape as `SnackbarOptions`, minus what the preset supplies. */
function isOptionsObject(value: unknown): value is SnackbarOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value) &&
    !('$$typeof' in value)
  );
}

function preset(variant: SnackbarVariant) {
  return (message: ReactNode, options: ToastPresetOptions = {}): string =>
    getDefaultStore().show({ ...options, message, variant });
}

function createToast(): ToastApi {
  const toast = ((
    content: ReactNode | SnackbarOptions,
    options?: ToastPresetOptions,
  ): string => {
    // `toast({ message, variant })` and `toast('Saved')` are both valid.
    if (options === undefined && isOptionsObject(content)) {
      return getDefaultStore().show(content);
    }
    return getDefaultStore().show({
      ...options,
      message: content as ReactNode,
    });
  }) as ToastApi;

  toast.show = (options) => getDefaultStore().show(options);
  toast.update = (id, options) => getDefaultStore().update(id, options);
  toast.dismiss = (id?: string, reason?: SnackbarCloseReason) =>
    getDefaultStore().dismiss(id, reason);
  toast.dismissAll = (reason?: SnackbarCloseReason) =>
    getDefaultStore().dismissAll(reason);

  toast.success = preset('success');
  toast.error = preset('error');
  toast.warning = preset('warning');
  toast.info = preset('info');
  toast.neutral = preset('neutral');
  toast.custom = preset('custom');
  toast.loading = (message, options = {}) =>
    getDefaultStore().show({
      ...options,
      message,
      variant: 'loading',
      duration: options.duration !== undefined ? options.duration : null,
    });

  toast.promise = <T,>(
    input: Promise<T>,
    messages: SnackbarPromiseOptions<T>,
    options?: SnackbarOptions,
  ): Promise<T> => getDefaultStore().promise(input, messages, options);

  Object.defineProperty(toast, 'store', {
    get: getDefaultStore,
    enumerable: true,
  });

  return toast;
}

/**
 * Fire-and-forget toast API that works anywhere — event handlers, data
 * layers, non-React modules — as long as a `<SnackbarProvider>` (or a
 * `<SnackbarHost store={getDefaultStore()} />`) is mounted.
 *
 * ```ts
 * import { toast } from 'react-snackbar-glass';
 *
 * toast.success('Deployment complete.', { title: 'v1.4.0 is live' });
 * toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Failed' });
 * ```
 */
export const toast: ToastApi = createToast();

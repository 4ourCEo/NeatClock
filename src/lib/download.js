/**
 * Platform-aware file download utility.
 *
 * On mobile iOS/Android: navigating to a blob URL (without the `download`
 * attribute) lets the OS MIME-type handler open the file — this triggers the
 * native Calendar app for `.ics` files. The `download` attribute explicitly
 * bypasses that handoff, so we omit it on mobile.
 *
 * On desktop: the standard `<a download>` anchor-click gives the familiar
 * Save dialog and unchanged user experience.
 *
 * Blob revocation is delayed on mobile because iOS reads the blob
 * asynchronously after navigation — revoking synchronously races against that.
 */

/** True on iOS Safari and Android Chrome/WebView */
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  // Also detect touch-only devices (e.g. iPad in desktop mode)
  const isTouch = navigator.maxTouchPoints > 0 && /Macintosh/i.test(ua);
  return isIOS || isAndroid || isTouch;
}


/**
 * Revoke a blob URL after a safe delay.
 * On mobile, iOS may read the blob after navigation completes, so we wait
 * longer before releasing the object URL reference.
 */
function revokeAfterDelay(url, isMobile) {
  setTimeout(() => URL.revokeObjectURL(url), isMobile ? 5000 : 100);
}

/**
 * Download a Blob.
 * - Mobile: opens the file via OS MIME handler (→ Calendar app for .ics)
 * - Desktop: triggers Save-As dialog via `<a download>`
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const mobile = isMobileDevice();

  if (mobile) {
    // Try Web Share API (Android Chrome 75+, iOS Safari 15+) for .ics files
    // so the user gets a full share-sheet / "Add to Calendar" prompt
    if (
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })
    ) {
      const file = new File([blob], filename, { type: blob.type });
      navigator.share({ files: [file], title: 'NeatClock Schedule' })
        .catch(() => {
          // User cancelled or share failed — fall back to href navigate
          window.location.href = url;
        })
        .finally(() => revokeAfterDelay(url, true));
      return;
    }

    // iOS Safari fallback: navigate to blob URL — Safari hands `.ics` to Calendar
    window.location.href = url;
    revokeAfterDelay(url, true);
    return;
  }

  // Desktop: standard anchor-click Save dialog
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  revokeAfterDelay(url, false);
}

export function downloadText(content, filename, mimeType = 'text/plain;charset=utf-8') {
  downloadBlob(new Blob([content], { type: mimeType }), filename);
}

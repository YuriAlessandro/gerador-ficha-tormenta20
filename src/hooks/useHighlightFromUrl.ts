import { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

function applyHighlight(el: HTMLElement): void {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('notification-highlight');
  window.setTimeout(() => {
    el.classList.remove('notification-highlight');
  }, 2400);
}

/**
 * Reads ?highlight=<id> from the URL and, once the host page has finished
 * loading its content, scrolls the element with id="comment-<id>" into view,
 * applies a brief highlight animation, and strips the param from the URL.
 *
 * Pass `loading=true` while the destination data is still being fetched so the
 * scroll waits for the target element to exist in the DOM.
 */
export function useHighlightFromUrl(loading: boolean): void {
  const location = useLocation();
  const history = useHistory();
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return undefined;

    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');
    if (!highlightId) return undefined;
    if (handledRef.current === highlightId) return undefined;

    // Wait one frame so the comment list has rendered after `loading` flipped.
    const rafId = requestAnimationFrame(() => {
      const el = document.getElementById(`comment-${highlightId}`);
      if (!el) {
        // Element may render slightly after `loading` becomes false (e.g. a
        // separate fetch for comments). Try once more after a short delay.
        window.setTimeout(() => {
          const retryEl = document.getElementById(`comment-${highlightId}`);
          if (retryEl) applyHighlight(retryEl);
        }, 400);
        return;
      }
      applyHighlight(el);
    });

    handledRef.current = highlightId;
    params.delete('highlight');
    const remaining = params.toString();
    history.replace({
      pathname: location.pathname,
      search: remaining ? `?${remaining}` : '',
      hash: location.hash,
    });

    return () => cancelAnimationFrame(rafId);
  }, [loading, location, history]);
}

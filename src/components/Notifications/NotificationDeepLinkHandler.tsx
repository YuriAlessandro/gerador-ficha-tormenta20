import React, { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { markNotificationAsRead } from '../../store/slices/notification/notificationSlice';

/**
 * Watches the current URL for ?fromNotification=<id> (set on push notification
 * URLs by the backend). When present, marks the notification as read in-app and
 * strips the query param so it doesn't leak into navigation history.
 *
 * The ?highlight=<commentId> param is consumed by the destination page and left
 * in place here — destination pages decide when to clear it themselves.
 */
const NotificationDeepLinkHandler: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => !!state.auth.firebaseUser);
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const params = new URLSearchParams(location.search);
    const notificationId = params.get('fromNotification');
    if (!notificationId) return;

    // Avoid re-firing for the same id within a session (e.g. on prop/state
    // changes that re-run effects before the URL replace lands).
    if (handledRef.current === notificationId) return;
    handledRef.current = notificationId;

    dispatch(markNotificationAsRead(notificationId));

    params.delete('fromNotification');
    const remaining = params.toString();
    const newSearch = remaining ? `?${remaining}` : '';
    history.replace({
      pathname: location.pathname,
      search: newSearch,
      hash: location.hash,
    });
  }, [isAuthenticated, location, history, dispatch]);

  return null;
};

export default NotificationDeepLinkHandler;

import ReactGA from 'react-ga';
import Keys from './.config/keys';

export function setup(testMode = false): void {
  ReactGA.initialize(Keys.TRACKING_ID, { testMode });
}

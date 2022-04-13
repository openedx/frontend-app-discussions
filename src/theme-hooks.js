import { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';

export async function loadComponent(scope, module) {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  // Webpack module federation allows sharing common dependencies, like `react`, `react-dom` etc
  // between modules so that they are no loaded multiple times. The following line will initialise
  // the system for sharing common modules.
  // Since there are no shared module here, you can safely comment out the next three lines and this
  // will still work.
  // eslint-disable-next-line no-undef
  await __webpack_init_sharing__('default');
  const container = window[scope];
  // eslint-disable-next-line no-undef
  await container.init(__webpack_share_scopes__.default);
  const factory = await window[scope].get(module);
  return factory();
} // The hook loads the supplied theme, and if the current theme changes it will
// Given a script URL this hook will add the script to the body. When the url
// changes it will unload the previous script.
// For theming, if we know where the script will come from in advance we can just
// include it in the HTML and not load it at runtime. However, that would
// require supplying that as a build-time value. Keeping this dynamic allows us
// to use it
function useDynamicScript(url) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) {
      return undefined;
    }

    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${url}`);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic Script Removed: ${url}`);
      document.head.removeChild(element);
    };
  }, [url]);

  return {
    ready,
    failed,
  };
}

// unload the previous theme and load the new one.
export function useTheme(theme) {
  const { ready } = useDynamicScript(getConfig().THEME_LOADER_URL);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!ready) {
      return undefined;
    }
    let styles = null;
    (async () => {
      const themeComponent = await loadComponent(theme, './theme');
      styles = themeComponent.styles;

      themeComponent.styles.use();
      setLoaded(true);
    })();
    // eslint-disable-next-line no-unused-expressions
    return () => {
      if (styles) {
        styles.unuse();
      }
      setLoaded(false);
    };
  }, [ready]);
  return loaded;
}

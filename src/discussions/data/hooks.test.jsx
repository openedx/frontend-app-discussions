import { useRef } from 'react';

import { render, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { useContainerSizeForParent } from './hooks';

let store;
initializeMockApp();
describe('Hooks', () => {
  function ComponentWithHook() {
    const refContainer = useRef(null);
    useContainerSizeForParent(refContainer);
    return (
      <div>
        <div ref={refContainer} />
      </div>
    );
  }

  function renderComponent() {
    return render(
      <IntlProvider locale="en">
        <ResponsiveContext.Provider value={{ width: 1280 }}>
          <AppProvider store={store}>
            <MemoryRouter initialEntries={['/']}>
              <ComponentWithHook />
            </MemoryRouter>
          </AppProvider>
        </ResponsiveContext.Provider>
      </IntlProvider>,
    );
  }

  let parent;
  beforeEach(() => {
    store = initializeStore();
    parent = window.parent;
  });
  afterEach(() => {
    window.parent = parent;
  });
  test('useContainerSizeForParent enabled', async () => {
    delete window.parent;
    window.parent = { ...window, postMessage: jest.fn() };
    const { unmount } = renderComponent();
    await waitFor(() => expect(window.parent.postMessage).toHaveBeenCalledTimes(1));
    // Test that size is reset on unmount
    unmount();
    await waitFor(() => expect(window.parent.postMessage).toHaveBeenCalledTimes(2));
    expect(window.parent.postMessage).toHaveBeenLastCalledWith(
      { type: 'plugin.resize', payload: { height: null } },
      'http://localhost:2000',
    );
  });
  test('useContainerSizeForParent disabled', async () => {
    window.parent.postMessage = jest.fn();
    renderComponent();
    await waitFor(() => expect(window.parent.postMessage).not.toHaveBeenCalled());
  });
});

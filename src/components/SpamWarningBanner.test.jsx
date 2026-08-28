import React, { act } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../store';
import SpamWarningBanner from './SpamWarningBanner';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

let store;

function renderComponent(props = {}) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <SpamWarningBanner {...props} />
      </AppProvider>
    </IntlProvider>,
  );
  return wrapper.container;
}

describe('SpamWarningBanner', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: ['Student'],
      },
    });
    store = initializeStore();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders banner when not dismissed', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderComponent();

    expect(screen.getByText('Reminder:')).toBeInTheDocument();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('discussions.spamWarningDismissed');
  });

  it('does not render banner when previously dismissed', () => {
    localStorageMock.getItem.mockReturnValue('true');

    renderComponent();

    expect(screen.queryByText('Reminder:')).not.toBeInTheDocument();
  });

  it('dismisses banner when close button is clicked', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderComponent();

    expect(screen.getByText('Reminder:')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close warning/i });
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('discussions.spamWarningDismissed', 'true');

    act(() => {
      expect(screen.queryByText('Reminder:')).not.toBeInTheDocument();
    });
  });

  it('persists dismissal state across page reloads', () => {
    localStorageMock.getItem.mockReturnValue('true');

    renderComponent();

    expect(screen.queryByText('Reminder:')).not.toBeInTheDocument();

    expect(localStorageMock.getItem).toHaveBeenCalledWith('discussions.spamWarningDismissed');
  });

  it('applies custom className when provided', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderComponent({ className: 'custom-test-class' });

    const bannerElement = document.querySelector('.spam-warning-banner.custom-test-class');
    expect(bannerElement).toBeInTheDocument();
  });

  it('still shows the banner when local storage cannot be read', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    renderComponent();

    expect(screen.getByText('Reminder:')).toBeInTheDocument();
  });

  it('dismisses the banner for this view when the dismissal cannot be stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    renderComponent();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /close warning/i }));
    });

    expect(screen.queryByText('Reminder:')).not.toBeInTheDocument();
  });

  it('renders a translation that does not contain the emphasised phrase', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const translated = 'Staff will never ask you for personal information.';

    // Rendered without AppProvider, which supplies an IntlProvider of its own
    // that would override the translation under test.
    render(
      <IntlProvider
        locale="en"
        messages={{ 'discussions.spamWarning.message': translated }}
      >
        <SpamWarningBanner />
      </IntlProvider>,
    );

    expect(screen.getByText(translated, { exact: false })).toBeInTheDocument();
    expect(document.querySelector('.spam-warning-message').textContent).toContain(translated);
    // Only the "Reminder:" heading is emphasised; there is no phrase to bold.
    const emphasised = document.querySelectorAll('.spam-warning-message strong');
    expect(emphasised).toHaveLength(1);
    expect(emphasised[0]).toHaveTextContent('Reminder:');
  });
});

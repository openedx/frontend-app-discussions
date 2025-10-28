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
});

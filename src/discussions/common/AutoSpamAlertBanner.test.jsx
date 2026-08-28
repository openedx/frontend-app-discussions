import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';

import AutoSpamAlertBanner from './AutoSpamAlertBanner';

function renderComponent(props = {}) {
  return render(
    <IntlProvider locale="en">
      <AutoSpamAlertBanner {...props} />
    </IntlProvider>,
  );
}

describe('AutoSpamAlertBanner', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: ['Student'],
      },
    });
  });

  it('renders nothing for content that was not flagged', () => {
    const { container } = renderComponent({ autoSpamFlagged: false });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the prop is omitted', () => {
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('announces flagged content pending staff review', () => {
    renderComponent({ autoSpamFlagged: true });

    expect(
      screen.getByText('Content automatically reported as possible spam pending staff review.'),
    ).toBeInTheDocument();
  });

  it('explains what automatic reporting means when the help icon is used', () => {
    renderComponent({ autoSpamFlagged: true });

    expect(screen.queryByText('What does "automatically reported" mean?')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /show more information about automatic flagging/i }));

    expect(screen.getByText('What does "automatically reported" mean?')).toBeInTheDocument();
    expect(
      screen.getByText(/only visible to course staff and remains hidden from learners/i),
    ).toBeInTheDocument();
  });
});

import React from 'react';

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';

import Tabs from './Tabs';
import useIndexOfLastVisibleChild from './useIndexOfLastVisibleChild';

jest.mock('./useIndexOfLastVisibleChild');

describe('Tabs', () => {
  const mockChildren = [...Array(4).keys()].map(i => (<button key={i} type="button">{`Item ${i}`}</button>));
  // Only half of the children will be visible. The rest of them will be in the dropdown.
  const indexOfLastVisibleChild = mockChildren.length / 2 - 1;

  const invisibleStyle = { visibility: 'hidden' };
  useIndexOfLastVisibleChild.mockReturnValue([indexOfLastVisibleChild, null, invisibleStyle, null]);

  function renderComponent(children = null) {
    render(
      <IntlProvider locale="en">
        <Tabs>
          {children}
        </Tabs>
      </IntlProvider>,
    );
  }

  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
  });

  it('renders without children', async () => {
    renderComponent();
    expect(screen.getByRole('button', { text: 'More...', hidden: true })).toBeInTheDocument();
  });

  it('hides invisible children', async () => {
    renderComponent(mockChildren);
    // adding hidden property is necessary because everything enclosed in a div with property hidden
    const allButtons = screen.getAllByRole('button', { hidden: true });
    expect(screen.getAllByRole('button', { hidden: false })).toHaveLength(3);
    [...Array(mockChildren.length).keys()].forEach(i => {
      if (i <= indexOfLastVisibleChild + 1) {
        expect(allButtons[i]).not.toHaveAttribute('style');
      } else {
        expect(allButtons[i]).toHaveStyle('visibility: hidden;');
      }
    });
  });
});

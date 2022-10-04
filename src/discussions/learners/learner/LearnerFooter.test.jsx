import React from 'react';

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../../store';
import messages from '../messages';
import LearnerFooter from './LearnerFooter';

let store;

function renderComponent(learner) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <LearnerFooter learner={learner} />
      </AppProvider>
    </IntlProvider>,
  );
}

const mockLearner = {
  threads: 5,
  replies: 1,
  responses: 3,
  activeFlags: null,
  inactiveFlags: null,
  username: 'username',
};

const mockLearnerWithFlags = {
  threads: 5,
  replies: 1,
  responses: 3,
  activeFlags: 1,
  inactiveFlags: 2,
  username: 'username',
};

describe('LearnerFooter', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  it('Always shows threads and replies icons', () => {
    renderComponent(mockLearner);
    expect(screen.getByText(mockLearner.threads)).toBeTruthy();
    expect(screen.getByText(mockLearner.replies + mockLearner.responses + mockLearner.threads)).toBeTruthy();
  });

  it('shows flags when the learner have ones', () => {
    renderComponent(mockLearnerWithFlags);
    expect(screen.queryByText(messages.reported)).toBeFalsy();
    expect(screen.queryByText(messages.previouslyReported)).toBeFalsy();
  });
});

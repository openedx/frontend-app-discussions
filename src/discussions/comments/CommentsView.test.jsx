/**
 * @jest-environment jsdom
 */
import React from 'react';
import { MemoryRouter, Route } from 'react-router';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeStore } from '../../store';
import { IntlProvider } from 'react-intl';

import CommentsView from './CommentsView';

const postId = 1;
let container;
let store;
let axiosMock;

function renderComponent() {
  const wrapper = render(
    <IntlProvider locale='en'>
      <AppProvider store={store}>
        <MemoryRouter initialEntries={['comments/1']}>
          <Route path='comments/:postId'>
            <CommentsView />
          </Route>
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>
  );
  container = wrapper.container;
}

describe('CommentsView', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        adminsitrator: true,
        roles: [],
      },
    });

    store = initializeStore({
      threads: {
        threadsById: {
          [postId]: {
            author: 'test author',
            title: 'test thread',
            voteCount: 0,
            type: 'discussion',
            pinned: false,
          },
        },
        avatars: {
          'test author': {
            profile: {
              image: '',
            },
          },
        },
      },
    });

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('test', async () => {
    renderComponent();
  });
});

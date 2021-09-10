/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeStore } from '../../store';

import CommentsView from './CommentsView';

let container;
let store;
let axiosMock;

function renderComponent() {
  const wrapper = render(
    <AppProvider store={store}>
      <CommentsView />
    </AppProvider>
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

    store = initializeStore({});

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('test', async () => {
    renderComponent();
  });
});

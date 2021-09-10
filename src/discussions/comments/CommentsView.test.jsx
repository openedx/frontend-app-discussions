/**
 * @jest-environment jsdom
 */
import React from 'react';
import { MemoryRouter, Route } from 'react-router';
import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from 'react-intl';

import { initializeStore } from '../../store';
import { commentsApiUrl } from './data/api';
import { selectThreadComments } from './data/selectors';

import CommentsView from './CommentsView';

const postId = '1';
let container;
let store;
let axiosMock;

const mockCommentsPaged = [
  [
    {
      threadId: postId,
      id: '1',
      renderedBody: 'test comment 1',
      voteCount: 0,
      author: 'testauthor',
      users: {
        'testauthor': {
          profile: {
            image: {
              image_url_small: '',
            },
          },
        },
      },
    },
  ],
  [
    {
      threadId: postId,
      id: '2',
      renderedBody: 'test comment 2',
      voteCount: 0,
      author: 'testauthor',
      users: {
        'testauthor': {
          profile: {
            image: {
              image_url_small: '',
            },
          },
        },
      },
    },
  ],
];

function mockAxiosReturnPagedComments() {
  const paramsTemplate = {
    thread_id: postId,
    page: undefined,
    page_size: undefined,
    requested_fields: 'profile_image',
  };

  const numPages = mockCommentsPaged.length;
  let page = 1;
  for (const comments of mockCommentsPaged) {
    axiosMock
      .onGet(commentsApiUrl, { params: { ...paramsTemplate, page } })
      .reply(200, {
        results: comments,
        pagination: {
          page,
          numPages,
        },
      });
    page++;
  }
}

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
            id: postId.toString(),
            author: 'testauthor',
            title: 'test thread',
            voteCount: 0,
            type: 'discussion',
            pinned: false,
          },
        },
        avatars: {
          'testauthor': {
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

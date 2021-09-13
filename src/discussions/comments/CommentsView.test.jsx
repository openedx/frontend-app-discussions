/**
 * @jest-environment jsdom
 */
import React from 'react';
import { MemoryRouter, Route } from 'react-router';
import { render, screen, fireEvent } from '@testing-library/react';
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

  // TODO: use test id to prevent breaking from text changes
  const findLoadMoreCommentsButton = () =>
    screen.findByRole('button', { name: /load more comments/i });

  it('initially loads only the first page', async () => {
    const firstPageComment = mockCommentsPaged[0][0];
    const secondPageComment = mockCommentsPaged[1][0];
    mockAxiosReturnPagedComments();
    renderComponent();

    await screen.findByText(firstPageComment.renderedBody);
    expect(screen.queryByText(secondPageComment.renderedBody)).not.toBeInTheDocument();
  });

  it('pressing load more button will load next page of comments', async () => {
    const firstPageComment = mockCommentsPaged[0][0];
    const secondPageComment = mockCommentsPaged[1][0];
    mockAxiosReturnPagedComments();
    renderComponent();

    const loadMoreButton = await findLoadMoreCommentsButton();
    fireEvent.click(loadMoreButton);

    await screen.findByText(secondPageComment.renderedBody);
  });

  it('newly loaded comments are appended to the old ones', async () => {
    const firstPageComment = mockCommentsPaged[0][0];
    const secondPageComment = mockCommentsPaged[1][0];
    mockAxiosReturnPagedComments();
    renderComponent();

    const loadMoreButton = await findLoadMoreCommentsButton();
    fireEvent.click(loadMoreButton);

    await screen.findByText(secondPageComment.renderedBody);
    // check that comments from the first pages are also displayed
    expect(screen.queryByText(firstPageComment.renderedBody)).toBeInTheDocument();
  });

  it('load more button is hidden when no more comments pages to load', async () => {
    const totalePages = mockCommentsPaged.length;
    mockAxiosReturnPagedComments();
    renderComponent();

    const loadMoreButton = await findLoadMoreCommentsButton();
    for (let page = 1; page < totalePages; page++)
      fireEvent.click(loadMoreButton);

    await expect(findLoadMoreCommentsButton()).rejects.toThrow();
  });
});

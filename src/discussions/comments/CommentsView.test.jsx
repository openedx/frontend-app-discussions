/**
 * @jest-environment jsdom
 */
import React from 'react';

import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { threadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import { commentsApiUrl } from './data/api';
import CommentsView from './CommentsView';
import messages from './messages';

import '../posts/data/__factories__';
import './data/__factories__';

const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
let store;
let axiosMock;

function mockAxiosReturnPagedComments() {
  [null, false, true].forEach(endorsed => {
    const postId = endorsed === null ? discussionPostId : questionPostId;
    [1, 2].forEach(page => {
      axiosMock
        .onGet(commentsApiUrl, {
          params: {
            thread_id: postId,
            page,
            page_size: undefined,
            requested_fields: 'profile_image',
            endorsed,
          },
        })
        .reply(200, Factory.build('commentsResult', null, {
          threadId: postId,
          page,
          pageSize: 1,
          count: 2,
          endorsed,
        }));
    });
  });
}

function renderComponent(postId) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[`comments/${postId}`]}>
          <Route path="comments/:postId">
            <CommentsView />
          </Route>
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('CommentsView', () => {
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
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(threadsApiUrl)
      .reply(200, Factory.build('threadsResult'));

    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    mockAxiosReturnPagedComments();
  });

  describe('for discussion thread', () => {
    const findLoadMoreCommentsButton = () => screen.findByRole('button', { name: messages.loadMoreResponses.defaultMessage });
    it('initially loads only the first page', async () => {
      renderComponent(discussionPostId);
      expect(await screen.findByText('comment number 1', { exact: false }))
        .toBeInTheDocument();
      expect(screen.queryByText('comment number 2', { exact: false }))
        .not
        .toBeInTheDocument();
    });

    it('pressing load more button will load next page of comments', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsButton();
      fireEvent.click(loadMoreButton);

      await screen.findByText('comment number 1', { exact: false });
      await screen.findByText('comment number 2', { exact: false });
    });

    it('newly loaded comments are appended to the old ones', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsButton();
      fireEvent.click(loadMoreButton);

      await screen.findByText('comment number 1', { exact: false });
      // check that comments from the first pages are also displayed
      expect(screen.queryByText('comment number 2', { exact: false }))
        .toBeInTheDocument();
    });

    it('load more button is hidden when no more comments pages to load', async () => {
      const totalPages = 2;
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsButton();
      for (let page = 1; page < totalPages; page++) {
        fireEvent.click(loadMoreButton);
      }

      await screen.findByText('comment number 2', { exact: false });
      await expect(findLoadMoreCommentsButton())
        .rejects
        .toThrow();
    });
  });

  describe('for question thread', () => {
    const findLoadMoreCommentsButtons = () => screen.findAllByRole('button', { name: messages.loadMoreResponses.defaultMessage });
    it('initially loads only the first page', async () => {
      act(() => renderComponent(questionPostId));
      expect(await screen.findByText('comment number 3', { exact: false }))
        .toBeInTheDocument();
      expect(await screen.findByText('endorsed comment number 5', { exact: false }))
        .toBeInTheDocument();
      expect(screen.queryByText('comment number 4', { exact: false }))
        .not
        .toBeInTheDocument();
    });

    it('pressing load more button will load next page of comments', async () => {
      await act(() => {
        renderComponent(questionPostId);
      });

      const [loadMoreButtonEndorsed, loadMoreButtonUnendorsed] = await findLoadMoreCommentsButtons();
      // Both load more buttons should show
      expect(await findLoadMoreCommentsButtons()).toHaveLength(2);
      expect(await screen.findByText('unendorsed comment number 3', { exact: false }))
        .toBeInTheDocument();
      expect(await screen.findByText('endorsed comment number 5', { exact: false }))
        .toBeInTheDocument();
      // Comments from next page should not be loaded yet.
      expect(await screen.queryByText('endorsed comment number 6', { exact: false }))
        .not
        .toBeInTheDocument();
      expect(await screen.queryByText('unendorsed comment number 4', { exact: false }))
        .not
        .toBeInTheDocument();

      await act(() => {
        fireEvent.click(loadMoreButtonEndorsed);
      });
      // Endorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByText('endorsed comment number 6', { exact: false }))
        .toBeInTheDocument());
      // Unndorsed comment from next page should not be loaded yet.
      expect(await screen.queryByText('unendorsed comment number 4', { exact: false }))
        .not
        .toBeInTheDocument();
      // Now only one load more buttons should show, for unendorsed comments
      expect(await findLoadMoreCommentsButtons()).toHaveLength(1);
      await act(() => {
        fireEvent.click(loadMoreButtonUnendorsed);
      });
      // Unndorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByText('unendorsed comment number 4', { exact: false }))
        .toBeInTheDocument());
      expect(findLoadMoreCommentsButtons()).rejects.toThrow();
    });
  });
});

import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import DiscussionContent from '../discussions-home/DiscussionContent';
import { getCommentsApiUrl } from '../post-comments/data/api';
import { fetchCommentResponses, fetchThreadComments } from '../post-comments/data/thunks';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import { DiscussionContext } from './context';

import '../posts/data/__factories__';
import '../post-comments/data/__factories__';

const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
const reverseOrder = true;
const enableInContextSidebar = false;
let store;
let axiosMock;
let container;

async function mockAxiosReturnPagedComments() {
  const endorsedArray = [null, false, true];
  const pageArray = [1, 2];

  endorsedArray.forEach(async (endorsed) => {
    const postId = endorsed === null ? discussionPostId : questionPostId;
    pageArray.forEach(async (page) => {
      const params = {
        thread_id: postId,
        page,
        page_size: undefined,
        requested_fields: 'profile_image',
        endorsed,
        reverse_order: reverseOrder,
        enable_in_context_sidebar: enableInContextSidebar,
        signal: {},
      };
      axiosMock.onGet(commentsApiUrl, { ...params }).reply(200, Factory.build('commentsResult', { can_delete: true }, {
        threadId: postId,
        page,
        pageSize: 1,
        count: 2,
        endorsed,
        childCount: page === 1 ? 2 : 0,
      }));

      await executeThunk(fetchThreadComments(postId, { ...params }), store.dispatch, store.getState);
    });
  });
}

async function mockAxiosReturnPagedCommentsResponses() {
  const parentId = 'comment-1';
  const commentsResponsesApiUrl = `${commentsApiUrl}${parentId}/`;
  const paramsTemplate = {
    page: undefined,
    page_size: undefined,
    requested_fields: 'profile_image',
    reverse_order: true,
  };

  [1, 2].forEach(async (page) => {
    axiosMock.onGet(commentsResponsesApiUrl, { params: { ...paramsTemplate, page } }).reply(200,
      Factory.build('commentsResult', null, {
        parentId,
        page,
        pageSize: 1,
        count: 2,
      }));

    await executeThunk(fetchCommentResponses(parentId), store.dispatch, store.getState);
  });
}

function renderComponent(postId) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{ courseId, postId }}
        >
          <MemoryRouter initialEntries={[`/${courseId}/posts/${postId}`]}>
            <DiscussionContent />
            <Route
              path="*"
            />
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
  return container;
}

describe('HoverCard', () => {
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
    axiosMock.onGet(threadsApiUrl).reply(200, Factory.build('threadsResult'));
    axiosMock.onPatch(new RegExp(`${commentsApiUrl}*`)).reply(({ url, data }) => {
      const commentId = url.match(/comments\/(?<id>[a-z1-9-]+)\//).groups.id;
      const { rawBody } = camelCaseObject(JSON.parse(data));
      return [200, Factory.build('comment', {
        id: commentId,
        rendered_body: rawBody,
        raw_body: rawBody,
      })];
    });
    axiosMock.onPost(commentsApiUrl).reply(({ data }) => {
      const { rawBody, threadId } = camelCaseObject(JSON.parse(data));
      return [200, Factory.build('comment', {
        rendered_body: rawBody,
        raw_body: rawBody,
        thread_id: threadId,
      })];
    });

    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    await mockAxiosReturnPagedComments();
    await mockAxiosReturnPagedCommentsResponses();
  });

  test('it should have hover card on post', async () => {
    await waitFor(() => renderComponent(discussionPostId));
    const post = screen.getByTestId('post-thread-1');
    expect(within(post).getByTestId('hover-card-thread-1')).toBeInTheDocument();
  });

  test('it should have hover card on comment', async () => {
    await waitFor(() => renderComponent(discussionPostId));
    const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
    expect(within(comment).getByTestId('hover-card-comment-1')).toBeInTheDocument();
  });

  test('it should show add response, like, follow and actions menu for hovered post', async () => {
    await waitFor(() => renderComponent(discussionPostId));
    const post = screen.getByTestId('post-thread-1');
    const view = within(post).getByTestId('hover-card-thread-1');

    expect(within(view).queryByRole('button', { name: /Add response/i })).toBeInTheDocument();
    expect(within(view).getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /follow/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });

  test('it should show add comment, Endorse, like and actions menu Buttons for hovered comment', async () => {
    await waitFor(() => renderComponent(discussionPostId));
    const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
    const view = within(comment).getByTestId('hover-card-comment-1');

    expect(within(view).queryByRole('button', { name: /Add comment/i })).toBeInTheDocument();
    expect(within(view).getByRole('button', { name: /Endorse/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });
});

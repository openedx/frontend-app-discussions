import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getCourseConfigApiUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import DiscussionContent from '../discussions-home/DiscussionContent';
import { getCommentsApiUrl } from '../post-comments/data/api';
import { fetchCommentResponses } from '../post-comments/data/thunks';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import DiscussionContext from './context';

import '../posts/data/__factories__';
import '../post-comments/data/__factories__';

const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const discussionPostId = 'thread-1';
const courseId = 'course-v1:edX+TestX+Test_Course';
let store;
let axiosMock;
let container;

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
    axiosMock.onGet(commentsResponsesApiUrl, { params: { ...paramsTemplate, page } }).reply(
      200,
      Factory.build('commentsResult', null, {
        parentId,
        page,
        pageSize: 1,
        count: 2,
      }),
    );

    await executeThunk(fetchCommentResponses(parentId), store.dispatch, store.getState);
  });
}

function renderComponent(postId) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <DiscussionContext.Provider
          value={{ courseId, postId, page: 'posts' }}
        >
          <MemoryRouter initialEntries={[`/${courseId}/posts/${postId}`]}>
            <DiscussionContent />
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
        isPostingEnabled: true,
      },
    });

    store = initializeStore();
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(threadsApiUrl).reply(200, Factory.build('threadsResult'));
    axiosMock.onGet(`${getCourseConfigApiUrl()}${courseId}/`).reply(200, { isPostingEnabled: true });
    axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult', { can_delete: true }, {
      threadId: discussionPostId,
      endorsed: false,
      pageSize: 1,
      count: 2,
      childCount: 2,
    }));

    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
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
    const hoverCard = within(post).getByTestId('hover-card-thread-1');

    expect(within(hoverCard).queryByRole('button', { name: /Add response/i })).toBeInTheDocument();
    expect(within(hoverCard).getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(within(hoverCard).queryByRole('button', { name: /follow/i })).toBeInTheDocument();
    expect(within(hoverCard).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });

  test('it should show add comment, Endorse, like and actions menu Buttons for hovered comment', async () => {
    await waitFor(() => renderComponent(discussionPostId));
    const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
    const hoverCard = within(comment).getByTestId('hover-card-comment-1');

    expect(within(hoverCard).queryByRole('button', { name: /Add comment/i })).toBeInTheDocument();
    expect(within(hoverCard).getByRole('button', { name: /Endorse/i })).toBeInTheDocument();
    expect(within(hoverCard).queryByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(within(hoverCard).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });
});

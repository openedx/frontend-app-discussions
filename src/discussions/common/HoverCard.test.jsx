import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { getCommentsApiUrl } from '../comments/data/api';
import DiscussionContent from '../discussions-home/DiscussionContent';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import { DiscussionContext } from './context';

import '../posts/data/__factories__';
import '../comments/data/__factories__';

const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
let store;
let axiosMock;
let container;

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
        .reply(200, Factory.build('commentsResult', { can_delete: true }, {
          threadId: postId,
          page,
          pageSize: 1,
          count: 2,
          endorsed,
          childCount: page === 1 ? 2 : 0,
        }));
    });
  });
}

function mockAxiosReturnPagedCommentsResponses() {
  const parentId = 'comment-1';
  const commentsResponsesApiUrl = `${commentsApiUrl}${parentId}/`;
  const paramsTemplate = {
    page: undefined,
    page_size: undefined,
    requested_fields: 'profile_image',
  };

  for (let page = 1; page <= 2; page++) {
    axiosMock
      .onGet(commentsResponsesApiUrl, { params: { ...paramsTemplate, page } })
      .reply(200, Factory.build('commentsResult', null, {
        parentId,
        page,
        pageSize: 1,
        count: 2,
      }));
  }
}

function renderComponent(postId) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{ courseId }}
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
  beforeEach(() => {
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
    axiosMock.onPatch(new RegExp(`${commentsApiUrl}*`)).reply(({
      url,
      data,
    }) => {
      const commentId = url.match(/comments\/(?<id>[a-z1-9-]+)\//).groups.id;
      const {
        rawBody,
      } = camelCaseObject(JSON.parse(data));
      return [200, Factory.build('comment', {
        id: commentId,
        rendered_body: rawBody,
        raw_body: rawBody,
      })];
    });
    axiosMock.onPost(commentsApiUrl)
      .reply(({ data }) => {
        const {
          rawBody,
          threadId,
        } = camelCaseObject(JSON.parse(data));
        return [200, Factory.build(
          'comment',
          {
            rendered_body: rawBody,
            raw_body: rawBody,
            thread_id: threadId,
          },
        )];
      });

    executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    mockAxiosReturnPagedComments();
    mockAxiosReturnPagedCommentsResponses();
  });

  test('it should show hover card when hovered on post', async () => {
    renderComponent(discussionPostId);
    const post = screen.getByTestId('post-thread-1');
    userEvent.hover(post);
    expect(screen.getByTestId('hover-card')).toBeInTheDocument();
  });

  test('it should show hover card when hovered on comment', async () => {
    renderComponent(discussionPostId);
    const comment = await waitFor(() => screen.findByTestId('comment-1'));
    userEvent.hover(comment);
    expect(screen.getByTestId('hover-card')).toBeInTheDocument();
  });

  test('it should not show hover card when post and comment not hovered', async () => {
    renderComponent(discussionPostId);
    expect(screen.queryByTestId('hover-card')).not.toBeInTheDocument();
  });

  test('it should show add response, like, follow and actions menu for hovered post', async () => {
    renderComponent(discussionPostId);
    const post = screen.getByTestId('post-thread-1');
    userEvent.hover(post);
    const view = screen.getByTestId('hover-card');
    expect(within(view).queryByRole('button', { name: /Add response/i })).toBeInTheDocument();
    expect(within(view).getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /follow/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });

  test('it should show add comment, Endorse, like and actions menu Buttons for hovered comment', async () => {
    renderComponent(questionPostId);
    const comment = await waitFor(() => screen.findByTestId('comment-3'));
    userEvent.hover(comment);
    const view = screen.getByTestId('hover-card');
    expect(screen.getByTestId('hover-card')).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /Add comment/i })).toBeInTheDocument();
    expect(within(view).getByRole('button', { name: /Endorse/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(within(view).queryByRole('button', { name: /actions menu/i })).toBeInTheDocument();
  });
});

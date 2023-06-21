import {
  act, fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getApiBaseUrl } from '../../data/constants';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { getCohortsApiUrl } from '../cohorts/data/api';
import { fetchCourseCohorts } from '../cohorts/data/thunks';
import { DiscussionContext } from '../common/context';
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import DiscussionContent from '../discussions-home/DiscussionContent';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThread, fetchThreads } from '../posts/data/thunks';
import { fetchCourseTopics } from '../topics/data/thunks';
import { getDiscussionTourUrl } from '../tours/data/api';
import { selectTours } from '../tours/data/selectors';
import { fetchDiscussionTours } from '../tours/data/thunks';
import discussionTourFactory from '../tours/data/tours.factory';
import { getCommentsApiUrl } from './data/api';
import { fetchCommentResponses, removeComment } from './data/thunks';

import '../posts/data/__factories__';
import './data/__factories__';
import '../topics/data/__factories__';
import '../cohorts/data/__factories__';

const courseConfigApiUrl = getCourseConfigApiUrl();
const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const closedPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
let store;
let axiosMock;
let testLocation;
let container;
let unmount;

async function mockAxiosReturnPagedComments(threadId, endorsed = false, page = 1, count = 2) {
  axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult', { can_delete: true }, {
    threadId,
    endorsed,
    pageSize: 1,
    count,
    childCount: page === 1 ? 2 : 0,
  }));
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
    axiosMock.onGet(commentsResponsesApiUrl, { params: { ...paramsTemplate, page } }).reply(
      200,
      Factory.build('commentsResult', null, {
        threadId: discussionPostId,
        parentId,
        page,
        pageSize: 1,
        count: 2,
      }),
    );

    await executeThunk(fetchCommentResponses(parentId), store.dispatch, store.getState);
  });
}

async function getThreadAPIResponse(attr = null) {
  axiosMock.onGet(`${threadsApiUrl}${discussionPostId}/`).reply(200, Factory.build('thread', attr));
  await executeThunk(fetchThread(discussionPostId), store.dispatch, store.getState);
}

async function setupCourseConfig(reasonCodesEnabled = true) {
  axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
    has_moderation_privileges: true,
    isPostingEnabled: true,
    reason_codes_enabled: reasonCodesEnabled,
    editReasons: [
      { code: 'reason-1', label: 'reason 1' },
      { code: 'reason-2', label: 'reason 2' },
    ],
    postCloseReasons: [
      { code: 'reason-1', label: 'reason 1' },
      { code: 'reason-2', label: 'reason 2' },
    ],
  });
  axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
  await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
}

function renderComponent(postId, isClosed = false) {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{ courseId, postId, isClosed }}
        >
          <MemoryRouter initialEntries={[`/${courseId}/posts/${postId}`]}>
            <DiscussionContent />
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location;
                return null;
              }}
            />
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
  unmount = wrapper.unmount;
}

describe('PostView', () => {
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

    axiosMock.onGet(topicsApiUrl)
      .reply(200, {
        non_courseware_topics: Factory.buildList('topic', 1, {}, { topicPrefix: 'non-courseware-' }),
        courseware_topics: Factory.buildList('category', 1, {}, { name: 'courseware' }),
      });
    executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
  });

  it('should show Topic Info for non-courseware topics', async () => {
    await getThreadAPIResponse({ id: 'thread-1', topic_id: 'non-courseware-topic-1' });
    await waitFor(() => renderComponent(discussionPostId));
    expect(await screen.findByText('Related to')).toBeInTheDocument();
    expect(await screen.findByText('non-courseware-topic 1')).toBeInTheDocument();
  });

  it('should show Topic Info for courseware topics with category', async () => {
    await getThreadAPIResponse({ id: 'thread-2', topic_id: 'courseware-topic-2' });

    await waitFor(() => renderComponent('thread-2'));
    expect(await screen.findByText('Related to')).toBeInTheDocument();
    expect(await screen.findByText('category-1 / courseware-topic 2')).toBeInTheDocument();
  });
});

describe('ThreadView', () => {
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
    axiosMock.onGet(getCohortsApiUrl(courseId)).reply(200, Factory.buildList('cohort', 3));
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
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, { isPostingEnabled: true });

    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
    await executeThunk(fetchCourseCohorts(courseId), store.dispatch, store.getState);
    await mockAxiosReturnPagedComments(discussionPostId);
    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    await mockAxiosReturnPagedCommentsResponses();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  describe('for all post types', () => {
    function assertLastUpdateData(data) {
      expect(JSON.parse(axiosMock.history.patch[axiosMock.history.patch.length - 1].data)).toMatchObject(data);
    }

    it('should not allow posting a comment on a closed post', async () => {
      axiosMock.reset();
      await mockAxiosReturnPagedComments(closedPostId, true);
      await waitFor(() => renderComponent(closedPostId, true));
      const comments = await waitFor(() => screen.findAllByTestId('comment-comment-4'));
      const hoverCard = within(comments[0]).getByTestId('hover-card-comment-4');

      expect(within(hoverCard).getByRole('button', { name: /Add comment/i })).toBeDisabled();
    });

    it('should display post content', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      const post = await waitFor(() => screen.getByTestId('post-thread-1'));

      expect(within(post).queryByTestId(discussionPostId)).toBeInTheDocument();
    });

    it('should display comment content', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));

      expect(within(comment).queryByTestId('comment-1')).toBeInTheDocument();
    });

    it('should not show post footer', async () => {
      Factory.resetAll();
      await getThreadAPIResponse({
        vote_count: 0, following: false, closed: false, group_id: null,
      });
      await waitFor(() => renderComponent(discussionPostId));

      expect(screen.queryByTestId('post-footer')).not.toBeInTheDocument();
    });

    it('should show post footer', async () => {
      Factory.resetAll();
      await getThreadAPIResponse({
        vote_count: 4, following: true, closed: false, group_id: null,
      });
      await waitFor(() => renderComponent(discussionPostId));

      expect(screen.queryByTestId('post-footer')).toBeInTheDocument();
    });

    it('should show and hide the editor', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const post = screen.getByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      const addResponseButton = within(hoverCard).getByRole('button', { name: /Add response/i });

      await act(async () => { fireEvent.click(addResponseButton); });
      expect(screen.queryByTestId('tinymce-editor')).toBeInTheDocument();

      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /cancel/i })); });
      expect(screen.queryByTestId('tinymce-editor')).not.toBeInTheDocument();
    });

    it('should allow posting a response', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      const addResponseButton = within(hoverCard).getByRole('button', { name: /Add response/i });
      await act(async () => { fireEvent.click(addResponseButton); });
      await act(async () => { fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } }); });
      await act(async () => { fireEvent.click(screen.getByText(/submit/i)); });

      expect(screen.queryByTestId('tinymce-editor')).not.toBeInTheDocument();
      await waitFor(async () => expect(await screen.findByTestId('comment-1')).toBeInTheDocument());
    });

    it('should not allow posting a response on a closed post', async () => {
      renderComponent(closedPostId);
      const post = screen.getByTestId('post-thread-2');
      const hoverCard = within(post).getByTestId('hover-card-thread-2');

      expect(within(hoverCard).getByRole('button', { name: /Add response/i })).toBeDisabled();
    });

    it('should allow posting a comment', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => { fireEvent.click(within(hoverCard).getByRole('button', { name: /Add comment/i })); });
      await act(async () => { fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } }); });
      await act(async () => { fireEvent.click(screen.getByText(/submit/i)); });

      expect(screen.queryByTestId('tinymce-editor')).not.toBeInTheDocument();
      await waitFor(async () => expect(await screen.findByTestId('reply-comment-2')).toBeInTheDocument());
    });

    it('should allow editing an existing comment', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => { fireEvent.click(within(hoverCard).getByRole('button', { name: /actions menu/i })); });
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /edit/i })); });
      await act(async () => { fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } }); });
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /submit/i })); });

      await waitFor(async () => {
        expect(await screen.findByTestId('comment-comment-1')).toBeInTheDocument();
      });
    });

    it('should show reason codes when closing a post', async () => {
      await setupCourseConfig();
      await waitFor(() => renderComponent(discussionPostId));

      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      expect(screen.queryByRole('dialog', { name: /close post/i })).not.toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
      });
      expect(screen.queryByRole('dialog', { name: /close post/i })).toBeInTheDocument();
      expect(screen.queryByRole('combobox', { name: /reason/i })).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: /reason \d/i })).toHaveLength(2);
      await act(async () => {
        fireEvent.change(screen.queryByRole('combobox', { name: /reason/i }), { target: { value: 'reason-1' } });
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /close post/i }));
      });

      expect(screen.queryByRole('dialog', { name: /close post/i })).not.toBeInTheDocument();
      assertLastUpdateData({ closed: true, close_reason_code: 'reason-1' });
    });

    it('should show reason codes when editing an existing comment', async () => {
      setupCourseConfig();
      renderComponent(discussionPostId);
      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
      expect(screen.queryByRole('combobox', { name: /reason for editing/i })).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: /reason \d/i })).toHaveLength(2);
      await act(async () => {
        fireEvent.change(
          screen.queryByRole('combobox', { name: /reason for editing/i }),
          { target: { value: null } },
        );
      });
      await act(async () => {
        fireEvent.change(screen.queryByRole('combobox', { name: /reason for editing/i }), { target: { value: 'reason-1' } });
      });
      await act(async () => {
        fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } });
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });
      assertLastUpdateData({ edit_reason_code: 'reason-1' });
    });

    it('should close the post directly if reason codes are not enabled', async () => {
      await setupCourseConfig(false);
      await waitFor(() => renderComponent(discussionPostId));

      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      expect(screen.queryByRole('dialog', { name: /close post/i })).not.toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
      });
      expect(screen.queryByRole('dialog', { name: /close post/i })).not.toBeInTheDocument();
      assertLastUpdateData({ closed: true });
    });

    it.each([true, false])(
      'should reopen the post directly when reason codes enabled=%s',
      async (reasonCodesEnabled) => {
        await setupCourseConfig(reasonCodesEnabled);
        renderComponent(closedPostId);

        const post = screen.getByTestId('post-thread-2');
        const hoverCard = within(post).getByTestId('hover-card-thread-2');
        await act(async () => {
          fireEvent.click(
            within(hoverCard).getByRole('button', { name: /actions menu/i }),
          );
        });
        expect(screen.queryByRole('dialog', { name: /close post/i })).not.toBeInTheDocument();
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: /reopen/i }));
        });
        expect(screen.queryByRole('dialog', { name: /close post/i })).not.toBeInTheDocument();
        assertLastUpdateData({ closed: false });
      },
    );

    it('should show the editor if the post is edited', async () => {
      await setupCourseConfig(false);
      await waitFor(() => renderComponent(discussionPostId));

      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
      expect(testLocation.pathname).toBe(`/${courseId}/posts/${discussionPostId}/edit`);
    });

    it('should allow pinning the post', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /pin/i }));
      });
      assertLastUpdateData({ pinned: false });
    });

    it('should allow reporting the post', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /report/i }));
      });
      expect(screen.queryByRole('dialog', { name: /Report \w+/i, exact: false })).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.queryByRole('button', { name: /Confirm/i }));
      });
      expect(screen.queryByRole('dialog', { name: /Report \w+/i, exact: false })).not.toBeInTheDocument();
      assertLastUpdateData({ abuse_flagged: true });
    });

    it('handles liking a post', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /like/i }),
        );
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject({ voted: true });
    });

    it('handles liking a comment', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /like/i }),
        );
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject({ voted: true });
    });

    it('handles endorsing comments', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      // Wait for the content to load
      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => {
        fireEvent.click(within(hoverCard).getByRole('button', { name: /Endorse/i }));
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject({ endorsed: true });
    });

    it('handles reporting comments', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      // Wait for the content to load
      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Report/i }));
      });
      expect(screen.queryByRole('dialog', { name: /Report \w+/i, exact: false })).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.queryByRole('button', { name: /Confirm/i }));
      });
      expect(screen.queryByRole('dialog', { name: /Report \w+/i, exact: false })).not.toBeInTheDocument();
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject({ abuse_flagged: true });
    });
  });

  describe('for discussion thread', () => {
    const findLoadMoreCommentsButton = () => screen.findByTestId('load-more-comments');

    it('shown post not found when post id does not belong to course', async () => {
      await waitFor(() => renderComponent('unloaded-id'));
      expect(await screen.findByText('Thread not found', { exact: true }))
        .toBeInTheDocument();
    });

    it('initially loads only the first page', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      expect(await screen.findByTestId('comment-comment-1'))
        .toBeInTheDocument();
      expect(screen.queryByTestId('comment-comment-2'))
        .not
        .toBeInTheDocument();
    });

    it('pressing load more button will load next page of comments', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      await mockAxiosReturnPagedComments(discussionPostId, false, 2);

      const loadMoreButton = await findLoadMoreCommentsButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByTestId('comment-comment-1');
      await screen.findByTestId('comment-comment-4');
    });

    it('newly loaded comments are appended to the old ones', async () => {
      await waitFor(() => renderComponent(discussionPostId));
      await mockAxiosReturnPagedComments(discussionPostId, false, 2);

      const loadMoreButton = await findLoadMoreCommentsButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByTestId('comment-comment-1');
      // check that comments from the first page are also displayed
      expect(screen.queryByTestId('comment-comment-4'))
        .toBeInTheDocument();
    });
  });

  describe('for question thread', () => {
    const findLoadMoreCommentsButtons = () => screen.findByTestId('load-more-comments');

    it('initially loads only the first page', async () => {
      await mockAxiosReturnPagedComments(questionPostId);
      act(() => renderComponent(questionPostId));

      expect(await screen.findByTestId('comment-comment-4'))
        .toBeInTheDocument();
      expect(screen.queryByTestId('comment-comment-5'))
        .not
        .toBeInTheDocument();
    });

    it('pressing load more button will load next page of comments', async () => {
      await mockAxiosReturnPagedComments(questionPostId);
      await waitFor(() => renderComponent(questionPostId));

      const loadMoreButton = await findLoadMoreCommentsButtons();

      expect(await screen.findByTestId('comment-comment-4'))
        .toBeInTheDocument();
      // Comments from next page should not be loaded yet.
      expect(await screen.queryByTestId('comment-comment-5'))
        .not
        .toBeInTheDocument();
      await mockAxiosReturnPagedComments(questionPostId, false, 2, 1);
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });
      // Endorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByTestId('comment-comment-5'))
        .toBeInTheDocument());
    });
  });

  describe('for comments replies', () => {
    const findLoadMoreCommentsResponsesButton = () => screen.findByTestId('load-more-comments-responses');

    it('initially loads only the first page', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      await waitFor(() => screen.findByTestId('reply-comment-2'));
      expect(screen.queryByTestId('reply-comment-3')).not.toBeInTheDocument();
    });

    it('pressing load more button will load next page of responses', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });
      await screen.findByTestId('reply-comment-3');
    });

    it('newly loaded responses are appended to the old ones', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByTestId('reply-comment-3');
      // check that comments from the first page are also displayed
      expect(screen.queryByTestId('reply-comment-2')).toBeInTheDocument();
    });

    it('load more button is hidden when no more responses pages to load', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByTestId('reply-comment-3');
    });
  });

  describe.each([
    { component: 'post', testId: 'post-thread-1', cardId: 'hover-card-thread-1' },
    { component: 'comment', testId: 'comment-comment-1', cardId: 'hover-card-comment-1' },
  ])('delete confirmation modal', ({
    component,
    testId,
    cardId,
  }) => {
    test(`for ${component}`, async () => {
      await waitFor(() => renderComponent(discussionPostId));
      // Wait for the content to load
      const post = await screen.findByTestId(testId);
      const hoverCard = within(post).getByTestId(cardId);
      expect(screen.queryByRole('dialog', { name: /Delete response/i, exact: false })).not.toBeInTheDocument();
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /actions menu/i }),
        );
      });
      await act(async () => {
        fireEvent.click(screen.queryByRole('button', { name: /Delete/i }));
      });
      expect(screen.queryByRole('dialog', { name: /Delete/i, exact: false })).toBeInTheDocument();
    });
  });

  describe('For comments replies', () => {
    it('shows action dropdown for replies', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const reply = await waitFor(() => screen.findByTestId('reply-comment-2'));
      expect(within(reply).getByRole('button', { name: /actions menu/i })).toBeInTheDocument();
    });

    it('should display reply content', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const reply = await waitFor(() => screen.findByTestId('reply-comment-2'));
      expect(within(reply).queryByTestId('comment-2')).toBeInTheDocument();
    });

    it('shows delete confirmation modal', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const reply = await waitFor(() => screen.findByTestId('reply-comment-2'));
      await act(async () => { fireEvent.click(within(reply).getByRole('button', { name: /actions menu/i })); });
      await act(async () => { fireEvent.click(screen.queryByRole('button', { name: /Delete/i })); });

      expect(screen.queryByRole('dialog', { name: /Delete/i, exact: false })).toBeInTheDocument();
    });
  });

  describe('for comments sort', () => {
    const getCommentSortDropdown = async () => {
      await waitFor(() => renderComponent(discussionPostId));

      await waitFor(() => screen.findByTestId('comment-comment-1'));
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Newest first/i })); });
      return waitFor(() => screen.findByTestId('comment-sort-dropdown-modal-popup'));
    };

    it('should show sort dropdown if there are endorse or unendorsed comments', async () => {
      await waitFor(() => renderComponent(discussionPostId));

      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const sortWrapper = container.querySelector('.comments-sort');
      const sortDropDown = within(sortWrapper).getByRole('button', { name: /Newest first/i });

      expect(comment).toBeInTheDocument();
      expect(sortDropDown).toBeInTheDocument();
    });

    it('should not show sort dropdown if there is no response', async () => {
      const commentId = 'comment-1';
      await waitFor(() => renderComponent(discussionPostId));

      await waitFor(() => screen.findByTestId('comment-comment-1'));
      axiosMock.onDelete(`${commentsApiUrl}${commentId}/`).reply(201);
      await executeThunk(removeComment(commentId, discussionPostId), store.dispatch, store.getState);

      expect(await waitFor(() => screen.findByText('No responses', { exact: true }))).toBeInTheDocument();
      expect(container.querySelector('.comments-sort')).not.toBeInTheDocument();
    });

    it('should have only two options', async () => {
      const dropdown = await getCommentSortDropdown();

      expect(dropdown).toBeInTheDocument();
      expect(await within(dropdown).getAllByRole('button')).toHaveLength(2);
    });

    it('should be selected Newest first and auto focus', async () => {
      const dropdown = await getCommentSortDropdown();

      expect(within(dropdown).getByRole('button', { name: /Newest first/i })).toBeInTheDocument();
      expect(within(dropdown).getByRole('button', { name: /Newest first/i })).toHaveFocus();
      expect(within(dropdown).getByRole('button', { name: /Oldest first/i })).not.toHaveFocus();
    });

    test('successfully handles sort state update', async () => {
      const dropdown = await getCommentSortDropdown();

      expect(store.getState().comments.sortOrder).toBeTruthy();
      await act(async () => { fireEvent.click(within(dropdown).getByRole('button', { name: /Oldest first/i })); });

      expect(store.getState().comments.sortOrder).toBeFalsy();
    });

    test('successfully handles tour state update', async () => {
      const tourName = 'response_sort';
      await axiosMock.onGet(getDiscussionTourUrl(), {}).reply(200, [discussionTourFactory.build({ tourName })]);
      await executeThunk(fetchDiscussionTours(), store.dispatch, store.getState);

      await waitFor(() => renderComponent(discussionPostId));

      await waitFor(() => screen.findByTestId('comment-comment-1'));
      const responseSortTour = () => selectTours(store.getState()).find(item => item.tourName === 'response_sort');

      expect(responseSortTour().enabled).toBeTruthy();
      await unmount();
      expect(responseSortTour().enabled).toBeFalsy();
    });
  });
});

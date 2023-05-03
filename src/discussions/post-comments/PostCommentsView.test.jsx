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
import { removeComment } from './data/thunks';

import '../posts/data/__factories__';
import './data/__factories__';
import '../topics/data/__factories__';

const courseConfigApiUrl = getCourseConfigApiUrl();
const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const closedPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
const reverseOrder = true;
const enableInContextSidebar = false;
let store;
let axiosMock;
let testLocation;
let container;
let unmount;

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
            reverse_order: reverseOrder,
            enable_in_context_sidebar: enableInContextSidebar,
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
    reverse_order: true,
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

async function getThreadAPIResponse(attr = null) {
  axiosMock.onGet(`${threadsApiUrl}${discussionPostId}/`)
    .reply(200, Factory.build('thread', attr));
  await executeThunk(fetchThread(discussionPostId), store.dispatch, store.getState);
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
    renderComponent(discussionPostId);
    expect(await screen.findByText('Related to')).toBeInTheDocument();
    expect(await screen.findByText('non-courseware-topic 1')).toBeInTheDocument();
  });

  it('should show Topic Info for courseware topics with category', async () => {
    await getThreadAPIResponse({ id: 'thread-2', topic_id: 'courseware-topic-2' });

    renderComponent('thread-2');
    expect(await screen.findByText('Related to')).toBeInTheDocument();
    expect(await screen.findByText('category-1 / courseware-topic 2')).toBeInTheDocument();
  });
});

describe('ThreadView', () => {
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

  describe('for all post types', () => {
    function assertLastUpdateData(data) {
      expect(JSON.parse(axiosMock.history.patch[axiosMock.history.patch.length - 1].data)).toMatchObject(data);
    }

    it('should display post content', async () => {
      renderComponent(discussionPostId);
      const post = screen.getByTestId('post-thread-1');
      expect(within(post).queryByTestId(discussionPostId)).toBeInTheDocument();
    });

    it('should display comment content', async () => {
      renderComponent(discussionPostId);
      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      expect(within(comment).queryByTestId('comment-1')).toBeInTheDocument();
    });

    it('should not show post footer', async () => {
      Factory.resetAll();
      await getThreadAPIResponse({
        vote_count: 0, following: false, closed: false, group_id: null,
      });
      renderComponent(discussionPostId);
      expect(screen.queryByTestId('post-footer')).not.toBeInTheDocument();
    });

    it('should show post footer', async () => {
      Factory.resetAll();
      await getThreadAPIResponse({
        vote_count: 4, following: true, closed: false, group_id: null,
      });
      renderComponent(discussionPostId);
      expect(screen.queryByTestId('post-footer')).toBeInTheDocument();
    });

    it('should show and hide the editor', async () => {
      renderComponent(discussionPostId);
      const post = screen.getByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      const addResponseButton = within(hoverCard).getByRole('button', { name: /Add response/i });
      await act(async () => {
        fireEvent.click(
          addResponseButton,
        );
      });
      expect(screen.queryByTestId('tinymce-editor')).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      });
      expect(screen.queryByTestId('tinymce-editor')).not.toBeInTheDocument();
    });

    it('should allow posting a response', async () => {
      renderComponent(discussionPostId);
      const post = await screen.findByTestId('post-thread-1');
      const hoverCard = within(post).getByTestId('hover-card-thread-1');
      const addResponseButton = within(hoverCard).getByRole('button', { name: /Add response/i });
      await act(async () => {
        fireEvent.click(
          addResponseButton,
        );
      });
      await act(() => {
        fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } });
      });

      await act(async () => {
        fireEvent.click(
          screen.getByText(/submit/i),
        );
      });
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
      renderComponent(discussionPostId);
      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-1');
      await act(async () => {
        fireEvent.click(
          within(hoverCard).getByRole('button', { name: /Add comment/i }),
        );
      });
      act(() => {
        fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } });
      });
      await act(async () => {
        fireEvent.click(
          screen.getByText(/submit/i),
        );
      });
      expect(screen.queryByTestId('tinymce-editor')).not.toBeInTheDocument();
      await waitFor(async () => expect(await screen.findByTestId('reply-comment-7')).toBeInTheDocument());
    });

    it('should not allow posting a comment on a closed post', async () => {
      renderComponent(closedPostId);
      const comment = await waitFor(() => screen.findByTestId('comment-comment-3'));
      const hoverCard = within(comment).getByTestId('hover-card-comment-3');
      expect(within(hoverCard).getByRole('button', { name: /Add comment/i })).toBeDisabled();
    });

    it('should allow editing an existing comment', async () => {
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
      act(() => {
        fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } });
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });
      await waitFor(async () => {
        expect(await screen.findByTestId('comment-comment-1')).toBeInTheDocument();
      });
    });

    async function setupCourseConfig(reasonCodesEnabled = true) {
      axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
        has_moderation_privileges: true,
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
        fireEvent.change(screen.queryByRole(
          'combobox',
          { name: /reason for editing/i },
        ), { target: { value: 'reason-1' } });
      });
      await act(async () => {
        fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } });
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });
      assertLastUpdateData({ edit_reason_code: 'reason-1' });
    });

    it('should show reason codes when closing a post', async () => {
      setupCourseConfig();
      renderComponent(discussionPostId);
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

    it('should close the post directly if reason codes are not enabled', async () => {
      setupCourseConfig(false);
      renderComponent(discussionPostId);
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
        setupCourseConfig(reasonCodesEnabled);
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
      setupCourseConfig(false);
      renderComponent(discussionPostId);
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
      renderComponent(discussionPostId);
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
      renderComponent(discussionPostId);
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
      renderComponent(discussionPostId);

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
      renderComponent(discussionPostId);

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
      renderComponent(discussionPostId);
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
      renderComponent(discussionPostId);
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
      renderComponent('unloaded-id');
      expect(await screen.findByText('Thread not found', { exact: true }))
        .toBeInTheDocument();
    });

    it('initially loads only the first page', async () => {
      renderComponent(discussionPostId);
      expect(await screen.findByTestId('comment-comment-1'))
        .toBeInTheDocument();
      expect(screen.queryByTestId('comment-comment-2'))
        .not
        .toBeInTheDocument();
    });

    it('pressing load more button will load next page of comments', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsButton();
      fireEvent.click(loadMoreButton);

      await screen.findByTestId('comment-comment-1');
      await screen.findByTestId('comment-comment-2');
    });

    it('newly loaded comments are appended to the old ones', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsButton();
      fireEvent.click(loadMoreButton);

      await screen.findByTestId('comment-comment-1');
      // check that comments from the first page are also displayed
      expect(screen.queryByTestId('comment-comment-2'))
        .toBeInTheDocument();
    });

    it('load more button is hidden when no more comments pages to load', async () => {
      const totalPages = 2;
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsButton();
      for (let page = 1; page < totalPages; page++) {
        fireEvent.click(loadMoreButton);
      }

      await screen.findByTestId('comment-comment-2');
      await expect(findLoadMoreCommentsButton())
        .rejects
        .toThrow();
    });
  });

  describe('for question thread', () => {
    const findLoadMoreCommentsButtons = () => screen.findAllByTestId('load-more-comments');

    it('initially loads only the first page', async () => {
      act(() => renderComponent(questionPostId));
      expect(await screen.findByTestId('comment-comment-3'))
        .toBeInTheDocument();
      expect(await screen.findByTestId('comment-comment-5'))
        .toBeInTheDocument();
      expect(screen.queryByTestId('comment-comment-4'))
        .not
        .toBeInTheDocument();
    });

    it('pressing load more button will load next page of comments', async () => {
      act(() => {
        renderComponent(questionPostId);
      });

      const [loadMoreButtonEndorsed, loadMoreButtonUnendorsed] = await findLoadMoreCommentsButtons();
      // Both load more buttons should show
      expect(await findLoadMoreCommentsButtons()).toHaveLength(2);
      expect(await screen.findByTestId('comment-comment-3'))
        .toBeInTheDocument();
      expect(await screen.findByTestId('comment-comment-5'))
        .toBeInTheDocument();
      // Comments from next page should not be loaded yet.
      expect(await screen.queryByTestId('comment-comment-6'))
        .not
        .toBeInTheDocument();
      expect(await screen.queryByTestId('comment-comment-4'))
        .not
        .toBeInTheDocument();

      await act(async () => {
        fireEvent.click(loadMoreButtonEndorsed);
      });
      // Endorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByTestId('comment-comment-6'))
        .toBeInTheDocument());
      // Unendorsed comment from next page should not be loaded yet.
      expect(await screen.queryByTestId('comment-comment-4'))
        .not
        .toBeInTheDocument();
      // Now only one load more buttons should show, for unendorsed comments
      expect(await findLoadMoreCommentsButtons()).toHaveLength(1);
      await act(async () => {
        fireEvent.click(loadMoreButtonUnendorsed);
      });
      // Unendorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByTestId('comment-comment-4'))
        .toBeInTheDocument());
      await expect(findLoadMoreCommentsButtons()).rejects.toThrow();
    });
  });

  describe('for comments replies', () => {
    const findLoadMoreCommentsResponsesButton = () => screen.findByTestId('load-more-comments-responses');

    it('initially loads only the first page', async () => {
      renderComponent(discussionPostId);

      await waitFor(() => screen.findByTestId('reply-comment-7'));
      expect(screen.queryByTestId('reply-comment-8')).not.toBeInTheDocument();
    });

    it('pressing load more button will load next page of responses', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByTestId('reply-comment-8');
    });

    it('newly loaded responses are appended to the old ones', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByTestId('reply-comment-8');
      // check that comments from the first page are also displayed
      expect(screen.queryByTestId('reply-comment-7')).toBeInTheDocument();
    });

    it('load more button is hidden when no more responses pages to load', async () => {
      const totalPages = 2;
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      for (let page = 1; page < totalPages; page++) {
        act(() => {
          fireEvent.click(loadMoreButton);
        });
      }

      await screen.findByTestId('reply-comment-8');
      await expect(findLoadMoreCommentsResponsesButton())
        .rejects
        .toThrow();
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
      renderComponent(discussionPostId);
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
      renderComponent(discussionPostId);

      const reply = await waitFor(() => screen.findByTestId('reply-comment-7'));
      expect(within(reply).getByRole('button', { name: /actions menu/i })).toBeInTheDocument();
    });

    it('should display reply content', async () => {
      renderComponent(discussionPostId);

      const reply = await waitFor(() => screen.findByTestId('reply-comment-7'));
      expect(within(reply).queryByTestId('comment-7')).toBeInTheDocument();
    });

    it('shows delete confirmation modal', async () => {
      renderComponent(discussionPostId);

      const reply = await waitFor(() => screen.findByTestId('reply-comment-7'));
      await act(async () => { fireEvent.click(within(reply).getByRole('button', { name: /actions menu/i })); });
      await act(async () => { fireEvent.click(screen.queryByRole('button', { name: /Delete/i })); });

      expect(screen.queryByRole('dialog', { name: /Delete/i, exact: false })).toBeInTheDocument();
    });
  });

  describe('for comments sort', () => {
    const getCommentSortDropdown = async () => {
      renderComponent(discussionPostId);

      await waitFor(() => screen.findByTestId('comment-comment-1'));
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Newest first/i })); });
      return waitFor(() => screen.findByTestId('comment-sort-dropdown-modal-popup'));
    };

    it('should show sort dropdown if there are endorse or unendorsed comments', async () => {
      renderComponent(discussionPostId);

      const comment = await waitFor(() => screen.findByTestId('comment-comment-1'));
      const sortWrapper = container.querySelector('.comments-sort');
      const sortDropDown = within(sortWrapper).getByRole('button', { name: /Newest first/i });

      expect(comment).toBeInTheDocument();
      expect(sortDropDown).toBeInTheDocument();
    });

    it('should not show sort dropdown if there is no response', async () => {
      const commentId = 'comment-1';
      renderComponent(discussionPostId);

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

      renderComponent(discussionPostId);

      await waitFor(() => screen.findByTestId('comment-comment-1'));
      const responseSortTour = () => selectTours(store.getState()).find(item => item.tourName === 'response_sort');

      expect(responseSortTour().enabled).toBeTruthy();
      await unmount();
      expect(responseSortTour().enabled).toBeFalsy();
    });
  });
});

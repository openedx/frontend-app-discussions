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

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { DiscussionContext } from '../common/context';
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import DiscussionContent from '../discussions-home/DiscussionContent';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import { getCommentsApiUrl } from './data/api';

import '../posts/data/__factories__';
import './data/__factories__';

const courseConfigApiUrl = getCourseConfigApiUrl();
const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const closedPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
let store;
let axiosMock;
let testLocation;

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
  render(
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
}

describe('CommentsView', () => {
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

    it('should show and hide the editor', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      const addResponseButtons = screen.getAllByRole('button', { name: /add a response/i });
      await act(async () => {
        fireEvent.click(
          addResponseButtons[0],
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
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      const responseButtons = screen.getAllByRole('button', { name: /add a response/i });
      await act(async () => {
        fireEvent.click(
          responseButtons[0],
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
      await waitFor(async () => expect(await screen.findByText('testing123', { exact: false })).toBeInTheDocument());
    });

    it('should not allow posting a response on a closed post', async () => {
      renderComponent(closedPostId);
      await waitFor(() => screen.findByText('Thread-2', { exact: false }));
      expect(screen.queryByRole('button', { name: /add a response/i })).not.toBeInTheDocument();
    });

    it('should allow posting a comment', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      await act(async () => {
        fireEvent.click(
          screen.getAllByRole('button', { name: /add a comment/i })[0],
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
      await waitFor(async () => expect(await screen.findByText('testing123', { exact: false })).toBeInTheDocument());
    });

    it('should not allow posting a comment on a closed post', async () => {
      renderComponent(closedPostId);
      await waitFor(() => screen.findByText('thread-2', { exact: false }));
      await act(async () => {
        expect(
          screen.queryByRole('button', { name: /add a comment/i }),
        ).not.toBeInTheDocument();
      });
    });

    it('should allow editing an existing comment', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post, the second will be for the first comment.
          screen.getAllByRole('button', { name: /actions menu/i })[1],
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
        expect(await screen.findByText('testing123', { exact: false })).toBeInTheDocument();
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
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post, the second will be for the first comment.
          screen.getAllByRole('button', { name: /actions menu/i })[1],
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
      expect(screen.queryByRole('combobox', { name: /reason for editing/i })).toBeInTheDocument();
      expect(screen.getAllByRole('option', { name: /reason \d/i })).toHaveLength(2);
      await act(async () => {
        fireEvent.change(screen.queryByRole('combobox', { name: /reason for editing/i }), { target: { value: null } });
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

    it('should show reason codes when closing a post', async () => {
      setupCourseConfig();
      renderComponent(discussionPostId);
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post
          screen.getAllByRole('button', {
            name: /actions menu/i,
          })[0],
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
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post
          screen.getAllByRole('button', { name: /actions menu/i })[0],
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
        await act(async () => {
          fireEvent.click(
            // The first edit menu is for the post
            screen.getAllByRole('button', { name: /actions menu/i })[0],
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
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post
          screen.getAllByRole('button', { name: /actions menu/i })[0],
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
      expect(testLocation.pathname).toBe(`/${courseId}/posts/${discussionPostId}/edit`);
    });
    it('should allow pinning the post', async () => {
      renderComponent(discussionPostId);
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post
          screen.getAllByRole('button', { name: /actions menu/i })[0],
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /pin/i }));
      });
      assertLastUpdateData({ pinned: false });
    });
    it('should allow reporting the post', async () => {
      renderComponent(discussionPostId);
      await act(async () => {
        fireEvent.click(
          // The first edit menu is for the post
          screen.getAllByRole('button', { name: /actions menu/i })[0],
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /report/i }));
      });
      assertLastUpdateData({ abuse_flagged: true });
    });

    it('handles liking a comment', async () => {
      renderComponent(discussionPostId);

      // Wait for the content to load
      await screen.findByText('comment number 7', { exact: false });
      const view = screen.getByTestId('comment-comment-1');

      const likeButton = within(view).getByRole('button', { name: /like/i });
      await act(async () => {
        fireEvent.click(likeButton);
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject({ voted: true });
    });

    it.each([
      ['endorsing comments', 'Endorse', { endorsed: true }],
      ['reporting comments', 'Report', { abuse_flagged: true }],
    ])('handles %s', async (label, buttonLabel, patchData) => {
      renderComponent(discussionPostId);

      // Wait for the content to load
      await screen.findByText('comment number 7', { exact: false });

      // There should be three buttons, one for the post, the second for the
      // comment and the third for a response to that comment
      const actionButtons = screen.queryAllByRole('button', { name: /actions menu/i });
      await act(async () => {
        fireEvent.click(actionButtons[1]);
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: buttonLabel }));
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject(patchData);
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
      // check that comments from the first page are also displayed
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
    const findLoadMoreCommentsButtons = () => screen.findAllByTestId('load-more-comments');

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
      act(() => {
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

      await act(async () => {
        fireEvent.click(loadMoreButtonEndorsed);
      });
      // Endorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByText('endorsed comment number 6', { exact: false }))
        .toBeInTheDocument());
      // Unendorsed comment from next page should not be loaded yet.
      expect(await screen.queryByText('unendorsed comment number 4', { exact: false }))
        .not
        .toBeInTheDocument();
      // Now only one load more buttons should show, for unendorsed comments
      expect(await findLoadMoreCommentsButtons()).toHaveLength(1);
      await act(async () => {
        fireEvent.click(loadMoreButtonUnendorsed);
      });
      // Unendorsed comment from next page should be loaded now.
      await waitFor(() => expect(screen.queryByText('unendorsed comment number 4', { exact: false }))
        .toBeInTheDocument());
      await expect(findLoadMoreCommentsButtons()).rejects.toThrow();
    });
  });

  describe('comments responses', () => {
    const findLoadMoreCommentsResponsesButton = () => screen.findByTestId('load-more-comments-responses');

    it('initially loads only the first page', async () => {
      renderComponent(discussionPostId);

      await waitFor(() => screen.findByText('comment number 7', { exact: false }));
      expect(screen.queryByText('comment number 8', { exact: false })).not.toBeInTheDocument();
    });

    it('pressing load more button will load next page of responses', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByText('comment number 8', { exact: false });
    });

    it('newly loaded responses are appended to the old ones', async () => {
      renderComponent(discussionPostId);

      const loadMoreButton = await findLoadMoreCommentsResponsesButton();
      await act(async () => {
        fireEvent.click(loadMoreButton);
      });

      await screen.findByText('comment number 8', { exact: false });
      // check that comments from the first page are also displayed
      expect(screen.queryByText('comment number 7', { exact: false })).toBeInTheDocument();
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

      await screen.findByText('comment number 8', { exact: false });
      await expect(findLoadMoreCommentsResponsesButton())
        .rejects
        .toThrow();
    });

    it('handles liking a comment', async () => {
      renderComponent(discussionPostId);

      // Wait for the content to load
      await screen.findByText('comment number 7', { exact: false });
      const view = screen.getByTestId('comment-comment-1');

      const likeButton = within(view).getByRole('button', { name: /like/i });
      await act(async () => {
        fireEvent.click(likeButton);
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject({ voted: true });
    });

    it.each([
      ['endorsing comments', 'Endorse', { endorsed: true }],
      ['reporting comments', 'Report', { abuse_flagged: true }],
    ])('handles %s', async (label, buttonLabel, patchData) => {
      renderComponent(discussionPostId);

      // Wait for the content to load
      await screen.findByText('comment number 7', { exact: false });

      // There should be three buttons, one for the post, the second for the
      // comment and the third for a response to that comment
      const actionButtons = screen.queryAllByRole('button', { name: /actions menu/i });
      await act(async () => {
        fireEvent.click(actionButtons[1]);
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: buttonLabel }));
      });
      expect(axiosMock.history.patch).toHaveLength(2);
      expect(JSON.parse(axiosMock.history.patch[1].data)).toMatchObject(patchData);
    });
  });

  describe.each([
    { component: 'post', testId: 'post-thread-1' },
    { component: 'comment', testId: 'comment-comment-1' },
    { component: 'reply', testId: 'reply-comment-7' },
  ])('delete confirmation modal', ({
    component,
    testId,
  }) => {
    test(`for ${component}`, async () => {
      renderComponent(discussionPostId);
      // Wait for the content to load
      await waitFor(() => expect(screen.queryByText('comment number 7', { exact: false })).toBeInTheDocument());
      const content = screen.getByTestId(testId);
      const actionsButton = within(content).getAllByRole('button', { name: /actions menu/i })[0];
      await act(async () => {
        fireEvent.click(actionsButton);
      });
      expect(screen.queryByRole('dialog', { name: /delete \w+/i, exact: false })).not.toBeInTheDocument();
      const deleteButton = within(content).queryByRole('button', { name: /delete/i });
      await act(async () => {
        fireEvent.click(deleteButton);
      });
      expect(screen.queryByRole('dialog', { name: /delete \w+/i, exact: false })).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.queryByRole('button', { name: /delete/i }));
      });
      expect(screen.queryByRole('dialog', { name: /delete \w+/i, exact: false })).not.toBeInTheDocument();
    });
  });
});

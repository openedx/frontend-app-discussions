import PropTypes from 'prop-types';

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
import { threadsApiUrl } from '../posts/data/api';
import { fetchThreads } from '../posts/data/thunks';
import { commentsApiUrl } from './data/api';
import CommentsView from './CommentsView';

import '../posts/data/__factories__';
import './data/__factories__';

const discussionPostId = 'thread-1';
const questionPostId = 'thread-2';
const courseId = 'course-v1:edX+TestX+Test_Course';
let store;
let axiosMock;

// Provides a mock editor component that functions like tinyMCE without the overhead
function MockEditor({
  onBlur,
  onEditorChange,
}) {
  return (
    <textarea
      data-testid="tinymce-editor"
      onChange={(event) => {
        onEditorChange(event.currentTarget.value);
      }}
      onBlur={event => {
        onBlur(event.currentTarget.value);
      }}
    />
  );
}

MockEditor.propTypes = {
  onBlur: PropTypes.func.isRequired,
  onEditorChange: PropTypes.func.isRequired,
};
jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: MockEditor,
  };
});

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

    await executeThunk(fetchThreads(courseId), store.dispatch, store.getState);
    mockAxiosReturnPagedComments();
    mockAxiosReturnPagedCommentsResponses();
  });

  describe('for all post types', () => {
    it('should show and hide the editor', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      act(() => {
        fireEvent.click(
          screen.getByRole('button', { name: /add a response/i }),
        );
      });
      expect(screen.queryByTestId('tinymce-editor')).toBeInTheDocument();
      act(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: /cancel/i,
          }),
        );
      });
      expect(screen.queryByTestId('tinymce-editor')).not.toBeInTheDocument();
    });
    it('should allow posting a response', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      act(() => {
        fireEvent.click(
          screen.getByRole('button', { name: /add a response/i }),
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
    it('should allow posting a comment', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      act(() => {
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
    it('should allow editing an existing comment', async () => {
      renderComponent(discussionPostId);
      await waitFor(() => screen.findByText('comment number 1', { exact: false }));
      act(() => {
        fireEvent.click(
          // The first edit menu is for the post, the second will be for the first comment.
          screen.getAllByRole('button', {
            name: /actions menu/i,
          })[1],
        );
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      });
      act(() => {
        fireEvent.change(screen.getByTestId('tinymce-editor'), { target: { value: 'testing123' } });
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });
      await waitFor(async () => {
        expect(await screen.findByText('testing123', { exact: false })).toBeInTheDocument();
      });
    });
  });

  describe('for discussion thread', () => {
    const findLoadMoreCommentsButton = () => screen.findByTestId('load-more-comments');

    it('shown spinner when post isn\'t loaded', async () => {
      renderComponent('unloaded-id');
      expect(await screen.findByTestId('loading-indicator'))
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

      act(() => {
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
      act(() => {
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
      await renderComponent(discussionPostId);
      // Wait for the content to load
      await screen.findByText('comment number 7', { exact: false });
      const content = screen.getByTestId(testId);
      const actionsButton = within(content)
        .getAllByRole('button', { name: /actions menu/i })[0];
      act(() => {
        fireEvent.click(actionsButton);
      });
      expect(screen.queryByRole('dialog', { name: /delete \w+/i, exact: false }))
        .not
        .toBeInTheDocument();
      const deleteButton = within(content)
        .queryByRole('button', { name: /delete/i });
      act(() => {
        fireEvent.click(deleteButton);
      });
      expect(screen.queryByRole('dialog', { name: /delete \w+/i, exact: false }))
        .toBeInTheDocument();
      act(() => {
        fireEvent.click(screen.queryByRole('button', { name: /delete/i }));
      });
      expect(screen.queryByRole('dialog', { name: /delete \w+/i, exact: false }))
        .not
        .toBeInTheDocument();
    });
  });
});

import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { AppProvider } from '@edx/frontend-platform/react';

import { ContentActions } from '../../data/constants';
import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import { getCourseConfigApiUrl } from '../data/api';
import fetchCourseConfig from '../data/thunks';
import messages from '../messages';
import { getCommentsApiUrl } from '../post-comments/data/api';
import { addComment, fetchThreadComments } from '../post-comments/data/thunks';
import PostCommentsContext from '../post-comments/postCommentsContext';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThread } from '../posts/data/thunks';
import { ACTIONS_LIST } from '../utils';
import ActionsDropdown from './ActionsDropdown';

import '../post-comments/data/__factories__';
import '../posts/data/__factories__';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

let store;
let axiosMock;
const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
const courseId = 'course-v1:edX+TestX+Test_Course';
const discussionThreadId = 'thread-1';
const questionThreadId = 'thread-2';
const commentContent = 'This is a comment for thread-1';
let discussionThread;
let questionThread;
let comment;

const buildTestContent = (buildParams, testMeta) => {
  const buildParamsSnakeCase = snakeCaseObject(buildParams);
  discussionThread = Factory.build('thread', { ...buildParamsSnakeCase, id: discussionThreadId }, null);
  questionThread = Factory.build('thread', { ...buildParamsSnakeCase, id: questionThreadId }, null);
  comment = Factory.build('comment', { ...buildParamsSnakeCase, thread_id: discussionThreadId }, null);

  return {
    discussion: {
      testFor: 'discussion threads',
      contentType: 'POST',
      ...camelCaseObject(discussionThread),
      ...testMeta,
    },
    question: {
      testFor: 'question threads',
      contentType: 'POST',
      ...camelCaseObject(questionThread),
      ...testMeta,
    },
    comment: {
      testFor: 'comments',
      contentType: 'COMMENT',
      type: 'discussion',
      ...camelCaseObject(comment),
      ...testMeta,
    },
  };
};

const mockThreadAndComment = async (response) => {
  axiosMock.onGet(`${threadsApiUrl}${discussionThreadId}/`).reply(200, response);
  axiosMock.onGet(`${threadsApiUrl}${questionThreadId}/`).reply(200, response);
  axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
  axiosMock.onPost(commentsApiUrl).reply(200, response);

  await executeThunk(fetchThread(discussionThreadId), store.dispatch, store.getState);
  await executeThunk(fetchThread(questionThreadId), store.dispatch, store.getState);
  await executeThunk(fetchThreadComments(discussionThreadId), store.dispatch, store.getState);
  await executeThunk(addComment(commentContent, discussionThreadId, null), store.dispatch, store.getState);
};

const canPerformActionTestData = ACTIONS_LIST.flatMap(({
  id, action, conditions, label: { defaultMessage },
}) => {
  const buildParams = { editable_fields: [action] };

  if (conditions) {
    Object.entries(conditions).forEach(([conditionKey, conditionValue]) => {
      buildParams[conditionKey] = conditionValue;
    });
  }

  const testContent = buildTestContent(buildParams, { label: defaultMessage, action });

  switch (id) {
    case 'answer':
    case 'unanswer':
      return [testContent.question];
    case 'endorse':
    case 'unendorse':
      return [testContent.comment, testContent.discussion];
    default:
      return [testContent.discussion, testContent.question, testContent.comment];
  }
});

const canNotPerformActionTestData = ACTIONS_LIST.flatMap(({ action, conditions, label: { defaultMessage } }) => {
  const label = defaultMessage;

  if (!conditions) {
    const content = buildTestContent({ editable_fields: [] }, { reason: 'field is not editable', label: defaultMessage });
    return [content.discussion, content.question, content.comment];
  }

  const reversedConditions = Object.fromEntries(Object.entries(conditions).map(([key, value]) => [key, !value]));

  const content = {
    // can edit field, but doesn't pass conditions
    ...buildTestContent({
      editable_fields: [action],
      ...reversedConditions,
    }, { reason: 'field is editable but does not pass condition', label, action }),

    // passes conditions, but can't edit field
    ...(action === ContentActions.DELETE ? {} : buildTestContent({
      editable_fields: [],
      ...conditions,
    }, { reason: 'passes conditions but field is not editable', label, action })),

    // can't edit field, and doesn't pass conditions
    ...buildTestContent({
      editable_fields: [],
      ...reversedConditions,
    }, { reason: 'can not edit field and does not match conditions', label, action }),
  };

  return [content.discussion, content.question, content.comment];
});

const renderComponent = ({
  id = '',
  contentType = 'POST',
  closed = false,
  type = 'discussion',
  postId = '',
  disabled = false,
  actionHandlers = {},
} = {}) => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <PostCommentsContext.Provider value={{
          isClosed: closed,
          postType: type,
          postId,
        }}
        >
          <ActionsDropdown
            id={id}
            disabled={disabled}
            actionHandlers={actionHandlers}
            contentType={contentType}
          />
        </PostCommentsContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
};

const findOpenActionsDropdownButton = async () => (
  screen.findByRole('button', { name: messages.actionsAlt.defaultMessage })
);

describe('ActionsDropdown', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore();
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    axiosMock.onGet(`${getCourseConfigApiUrl()}${courseId}/`)
      .reply(200, { isPostingEnabled: true });

    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  });

  it.each(Object.values(buildTestContent()))('can open drop down if enabled', async (commentOrPost) => {
    await mockThreadAndComment(commentOrPost);
    renderComponent({ ...commentOrPost });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup')).toBeInTheDocument());
  });

  it.each(Object.values(buildTestContent()))('can not open drop down if disabled', async (commentOrPost) => {
    await mockThreadAndComment(commentOrPost);
    renderComponent({ ...commentOrPost, disabled: true });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup')).not.toBeInTheDocument());
  });

  it('copy link action should be visible on posts', async () => {
    const discussionObject = buildTestContent({ editable_fields: ['copy_link'] }).discussion;
    await mockThreadAndComment(discussionObject);
    renderComponent({ ...camelCaseObject(discussionObject) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByText('Copy link')).toBeInTheDocument());
  });

  it('copy link action should not be visible on a comment', async () => {
    const commentObject = buildTestContent().comment;
    await mockThreadAndComment(commentObject);
    renderComponent({ ...camelCaseObject(commentObject) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByText('Copy link')).not.toBeInTheDocument());
  });

  it('should close the dropdown when pressing escape', async () => {
    const discussionObject = buildTestContent({ editable_fields: ['copy_link'] }).discussion;
    await mockThreadAndComment(discussionObject);
    renderComponent({ ...camelCaseObject(discussionObject) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument());

    await act(async () => {
      fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    });

    await waitFor(() => expect(screen.queryByRole('button', { name: 'Copy link' })).toBeNull());
  });

  describe.each(canPerformActionTestData)('Actions', ({
    testFor, action, label, ...commentOrPost
  }) => {
    describe(`for ${testFor}`, () => {
      it(`can "${label}" when allowed`, async () => {
        await mockThreadAndComment(commentOrPost);
        const mockHandler = jest.fn();
        renderComponent({ ...commentOrPost, actionHandlers: { [action]: mockHandler } });

        const openButton = await findOpenActionsDropdownButton();
        await act(async () => {
          fireEvent.click(openButton);
        });

        await waitFor(() => expect(screen.queryByText(label))
          .toBeInTheDocument());

        await act(async () => {
          fireEvent.click(screen.queryByText(label));
        });
        expect(mockHandler).toHaveBeenCalled();
      });
    });
  });

  describe.each(canNotPerformActionTestData)('Actions', ({
    testFor, action, label, reason, ...commentOrPost
  }) => {
    describe(`for ${testFor}`, () => {
      it(`can't "${label}" when ${reason}`, async () => {
        await mockThreadAndComment(commentOrPost);
        renderComponent({ ...commentOrPost });

        const openButton = await findOpenActionsDropdownButton();
        await act(async () => {
          fireEvent.click(openButton);
        });

        await waitFor(() => expect(screen.queryByText(label)).not.toBeInTheDocument());
      });
    });
  });

  it('applies in-context-sidebar class when inContextSidebar is in URL', async () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, search: '?inContextSidebar=true' };

    const discussionObject = buildTestContent().discussion;
    await mockThreadAndComment(discussionObject);

    renderComponent({ ...camelCaseObject(discussionObject) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    const dropdown = screen.getByTestId('actions-dropdown-modal-popup').closest('.actions-dropdown');
    expect(dropdown).toHaveClass('in-context-sidebar');

    window.location = originalLocation;
  });

  it('does not apply in-context-sidebar class when inContextSidebar is not in URL', async () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, search: '' };

    const discussionObject = buildTestContent().discussion;
    await mockThreadAndComment(discussionObject);

    renderComponent({ ...camelCaseObject(discussionObject) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    const dropdown = screen.getByTestId('actions-dropdown-modal-popup').closest('.actions-dropdown');
    expect(dropdown).not.toHaveClass('in-context-sidebar');

    window.location = originalLocation;
  });

  it('handles SSR environment when window is undefined', () => {
    const testSSRLogic = () => {
      if (typeof window !== 'undefined') {
        return window.location.search.includes('inContextSidebar');
      }
      return false;
    };

    const originalWindow = global.window;
    const originalProcess = global.process;

    try {
      delete global.window;

      const result = testSSRLogic();
      expect(result).toBe(false);

      global.window = originalWindow;
      const resultWithWindow = testSSRLogic();
      expect(resultWithWindow).toBe(false);
    } finally {
      global.window = originalWindow;
      global.process = originalProcess;
    }
  });

  it('calls logError for unknown action', async () => {
    const discussionObject = buildTestContent().discussion;
    await mockThreadAndComment(discussionObject);

    logError.mockClear();

    renderComponent({
      ...discussionObject,
      actionHandlers: {
        [ContentActions.EDIT_CONTENT]: jest.fn(),
      },
    });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    const copyLinkButton = await screen.findByText('Copy link');
    await act(async () => {
      fireEvent.click(copyLinkButton);
    });

    expect(logError).toHaveBeenCalledWith('Unknown or unimplemented action copy_link');
  });

  describe('posting restrictions', () => {
    it('removes edit action when posting is disabled', async () => {
      const discussionObject = buildTestContent({
        editable_fields: ['raw_body'],
      }).discussion;

      await mockThreadAndComment(discussionObject);

      axiosMock.onGet(`${getCourseConfigApiUrl()}${courseId}/`)
        .reply(200, { isPostingEnabled: false });

      await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);

      renderComponent({ ...discussionObject });

      const openButton = await findOpenActionsDropdownButton();
      await act(async () => {
        fireEvent.click(openButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      });
    });

    it('keeps edit action when posting is enabled', async () => {
      const discussionObject = buildTestContent({
        editable_fields: ['raw_body'],
      }).discussion;

      await mockThreadAndComment(discussionObject);

      axiosMock.onGet(`${getCourseConfigApiUrl()}${courseId}/`)
        .reply(200, { isPostingEnabled: true });

      await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);

      renderComponent({ ...discussionObject });

      const openButton = await findOpenActionsDropdownButton();
      await act(async () => {
        fireEvent.click(openButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Edit')).toBeInTheDocument();
      });
    });
  });
});

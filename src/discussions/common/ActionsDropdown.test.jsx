import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { ContentActions } from '../../data/constants';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import messages from '../messages';
import { getCommentsApiUrl } from '../post-comments/data/api';
import { addComment, fetchThreadComments } from '../post-comments/data/thunks';
import { PostCommentsContext } from '../post-comments/postCommentsContext';
import { getThreadsApiUrl } from '../posts/data/api';
import { fetchThread } from '../posts/data/thunks';
import { ACTIONS_LIST } from '../utils';
import ActionsDropdown from './ActionsDropdown';

import '../post-comments/data/__factories__';
import '../posts/data/__factories__';

let store;
let axiosMock;
const commentsApiUrl = getCommentsApiUrl();
const threadsApiUrl = getThreadsApiUrl();
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

  return [
    {
      testFor: 'discussion threads',
      contentType: 'POST',
      ...camelCaseObject(discussionThread),
      ...testMeta,
    },
    {
      testFor: 'question threads',
      contentType: 'POST',
      ...camelCaseObject(questionThread),
      ...testMeta,
    },
    {
      testFor: 'comments',
      contentType: 'COMMENT',
      type: 'discussion',
      ...camelCaseObject(comment),
      ...testMeta,
    },
  ];
};

const mockThreadAndComment = async () => {
  axiosMock.onGet(`${threadsApiUrl}${discussionThreadId}/`).reply(200, discussionThread);
  axiosMock.onGet(`${threadsApiUrl}${questionThreadId}/`).reply(200, questionThread);
  axiosMock.onGet(commentsApiUrl).reply(200, Factory.build('commentsResult'));
  axiosMock.onPost(commentsApiUrl).reply(200, comment);

  await executeThunk(fetchThread(discussionThreadId), store.dispatch, store.getState);
  await executeThunk(fetchThread(questionThreadId), store.dispatch, store.getState);
  await executeThunk(fetchThreadComments(discussionThreadId), store.dispatch, store.getState);
  await executeThunk(addComment(commentContent, discussionThreadId, null), store.dispatch, store.getState);
};

// const canPerformActionTestData = ACTIONS_LIST
//   .map(({ action, conditions, label: { defaultMessage } }) => {
//     const buildParams = {
//       editable_fields: [action],
//     };
//     if (conditions) {
//       Object.entries(conditions)
//         .forEach(([conditionKey, conditionValue]) => {
//           buildParams[conditionKey] = conditionValue;
//         });
//     }
//     return buildTestContent(buildParams, { label: defaultMessage, action });
//   })
//   .flat();

// const canNotPerformActionTestData = ACTIONS_LIST
//   .map(({ action, conditions, label: { defaultMessage } }) => {
//     const label = defaultMessage;
//     let content;
//     if (!conditions) {
//       content = buildTestContent({ editable_fields: [] }, { reason: 'field is not editable', label: defaultMessage });
//     } else {
//       const reversedConditions = Object.keys(conditions)
//         .reduce(
//           (results, key) => ({
//             ...results,
//             [key]: !conditions[key],
//           }),
//           {},
//         );

//       content = [
//         // can edit field, but doesn't pass conditions
//         ...buildTestContent({
//           editable_fields: [action],
//           ...reversedConditions,
//         }, { reason: 'field is editable but does not pass condition', label, action }),
//         // passes conditions, but can't edit field
//         ...(action === ContentActions.DELETE
//           ? []
//           : buildTestContent({
//             editable_fields: [],
//             ...conditions,
//           }, { reason: 'passes conditions but field is not editable', label, action })
//         ),
//         // can't edit field, and doesn't pass conditions
//         ...buildTestContent({
//           editable_fields: [],
//           ...reversedConditions,
//         }, { reason: 'can not edit field and does not match conditions', label, action }),
//       ];
//     }
//     return content;
//   })
//   .flat();

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
  beforeEach(() => {
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
  });

  it.each(buildTestContent())('can open drop down if enabled', async (commentOrPost) => {
    await mockThreadAndComment();
    renderComponent({ ...commentOrPost });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup')).toBeInTheDocument());
  });

  it.each(buildTestContent())('can not open drop down if disabled', async (commentOrPost) => {
    await mockThreadAndComment();
    renderComponent({ ...commentOrPost, disabled: true });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup')).not.toBeInTheDocument());
  });

  it('copy link action should be visible on posts', async () => {
    buildTestContent({ editable_fields: ['copy_link'] });
    await mockThreadAndComment();
    renderComponent({ ...camelCaseObject(discussionThread) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByText('Copy link')).toBeInTheDocument());
  });

  it('copy link action should not be visible on a comment', async () => {
    buildTestContent();
    await mockThreadAndComment();
    renderComponent({ ...camelCaseObject(comment) });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByText('Copy link')).not.toBeInTheDocument());
  });

  // describe.each(canPerformActionTestData)('Actions', ({
  //   testFor, action, label, reason, ...commentOrPost
  // }) => {
  //   describe(`for ${testFor}`, () => {
  //     it(`can "${label}" when allowed`, async () => {
  //       const mockHandler = jest.fn();
  //       renderComponent(
  //         commentOrPost,
  //         { actionHandlers: { [action]: mockHandler } },
  //       );

  //       const openButton = await findOpenActionsDropdownButton();
  //       await act(async () => {
  //         fireEvent.click(openButton);
  //       });

  //       await waitFor(() => expect(screen.queryByText(label))
  //         .toBeInTheDocument());

  //       await act(async () => {
  //         fireEvent.click(screen.queryByText(label));
  //       });
  //       expect(mockHandler).toHaveBeenCalled();
  //     });
  //   });
  // });

  // describe.each(canNotPerformActionTestData)('Actions', ({
  //   testFor, action, label, reason, ...commentOrPost
  // }) => {
  //   describe(`for ${testFor}`, () => {
  //     it(`can't "${label}" when ${reason}`, async () => {
  //       renderComponent(commentOrPost);

  //       const openButton = await findOpenActionsDropdownButton();
  //       await act(async () => {
  //         fireEvent.click(openButton);
  //       });

  //       await waitFor(() => expect(screen.queryByText(label)).not.toBeInTheDocument());
  //     });
  //   });
  // });
});

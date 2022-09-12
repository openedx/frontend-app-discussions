import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { ContentActions } from '../../data/constants';
import { initializeStore } from '../../store';
import messages from '../messages';
import { ACTIONS_LIST } from '../utils';
import ActionsDropdown from './ActionsDropdown';

import '../comments/data/__factories__';
import '../posts/data/__factories__';

let store;

function buildTestContent(buildParams, testMeta) {
  const buildParamsSnakeCase = snakeCaseObject(buildParams);
  return [
    {
      testFor: 'comments',
      ...camelCaseObject(Factory.build('comment', { ...buildParamsSnakeCase }, null)),
      ...testMeta,
    },
    {
      testFor: 'question threads',
      ...camelCaseObject(Factory.build('thread', { ...buildParamsSnakeCase, type: 'question' }, null)),
      ...testMeta,
    },
    {
      testFor: 'discussion threads',
      ...camelCaseObject(Factory.build('thread', { ...buildParamsSnakeCase, type: 'discussion' }, null)),
      ...testMeta,
    },
  ];
}

const canPerformActionTestData = ACTIONS_LIST
  .map(({ action, conditions, label: { defaultMessage } }) => {
    const buildParams = {
      editable_fields: [action],
    };
    if (conditions) {
      Object.entries(conditions)
        .forEach(([conditionKey, conditionValue]) => {
          buildParams[conditionKey] = conditionValue;
        });
    }
    return buildTestContent(buildParams, { label: defaultMessage, action });
  })
  .flat();

const canNotPerformActionTestData = ACTIONS_LIST
  .map(({ action, conditions, label: { defaultMessage } }) => {
    const label = defaultMessage;
    let content;
    if (!conditions) {
      content = buildTestContent({ editable_fields: [] }, { reason: 'field is not editable', label: defaultMessage });
    } else {
      const reversedConditions = Object.keys(conditions)
        .reduce(
          (results, key) => ({
            ...results,
            [key]: !conditions[key],
          }),
          {},
        );

      content = [
        // can edit field, but doesn't pass conditions
        ...buildTestContent({
          editable_fields: [action],
          ...reversedConditions,
        }, { reason: 'field is editable but does not pass condition', label, action }),
        // passes conditions, but can't edit field
        ...(action === ContentActions.DELETE
          ? []
          : buildTestContent({
            editable_fields: [],
            ...conditions,
          }, { reason: 'passes conditions but field is not editable', label, action })
        ),
        // can't edit field, and doesn't pass conditions
        ...buildTestContent({
          editable_fields: [],
          ...reversedConditions,
        }, { reason: 'can not edit field and does not match conditions', label, action }),
      ];
    }
    return content;
  })
  .flat();

function renderComponent(
  commentOrPost,
  { disabled = false, actionHandlers = {} } = {},
) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <ActionsDropdown
          commentOrPost={commentOrPost}
          disabled={disabled}
          actionHandlers={actionHandlers}
        />
      </AppProvider>
    </IntlProvider>,
  );
}

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
  });

  it.each(buildTestContent())('can open drop down if enabled', async (commentOrPost) => {
    renderComponent(commentOrPost, { disabled: false });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup')).toBeInTheDocument());
  });

  it.each(buildTestContent())('can not open drop down if disabled', async (commentOrPost) => {
    renderComponent(commentOrPost, { disabled: true });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup')).not.toBeInTheDocument());
  });

  it('copy link action should be visible on posts', async () => {
    const commentOrPost = {
      testFor: 'thread',
      ...camelCaseObject(Factory.build('thread', { editable_fields: ['copy_link'] }, null)),
    };
    renderComponent(commentOrPost, { disabled: false });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByText('Copy link')).toBeInTheDocument());
  });

  it('copy link action should not be visible on a comment', async () => {
    const commentOrPost = {
      testFor: 'comments',
      ...camelCaseObject(Factory.build('comment', {}, null)),
    };
    renderComponent(commentOrPost, { disabled: false });

    const openButton = await findOpenActionsDropdownButton();
    await act(async () => {
      fireEvent.click(openButton);
    });

    await waitFor(() => expect(screen.queryByText('Copy link')).not.toBeInTheDocument());
  });

  describe.each(canPerformActionTestData)('Actions', ({
    testFor, action, label, reason, ...commentOrPost
  }) => {
    describe(`for ${testFor}`, () => {
      it(`can "${label}" when allowed`, async () => {
        const mockHandler = jest.fn();
        renderComponent(
          commentOrPost,
          { actionHandlers: { [action]: mockHandler } },
        );

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
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        await act(async () => {
          fireEvent.click(openButton);
        });

        await waitFor(() => expect(screen.queryByText(label)).not.toBeInTheDocument());
      });
    });
  });
});

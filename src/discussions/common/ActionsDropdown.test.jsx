import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { ContentActions } from '../../data/constants';
import messages from '../messages';
import { ACTIONS_LIST } from '../utils';
import ActionsDropdown from './ActionsDropdown';

import '../posts/data/__factories__';
import '../comments/data/__factories__';

let store;

function buildTestContent(buildParams) {
  const buildParamsSnakeCase = snakeCaseObject(buildParams);
  return [
    Factory.build('comment', { ...buildParamsSnakeCase }, null),
    // question
    Factory.build('thread', { ...buildParamsSnakeCase }, null),
    // thread
    Factory.build('thread', { ...buildParamsSnakeCase }, null),
  ].map(content => camelCaseObject(content));
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
    return buildTestContent(buildParams)
      .map(commentOrPost => ([defaultMessage, commentOrPost, action]));
  })
  .flat();

const canNotPerformActionTestData = ACTIONS_LIST
  .map(({ action, conditions, label: { defaultMessage } }) => {
    let content;
    if (!conditions) {
      content = buildTestContent({
        editable_fields: [],
      });
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
        }),
        // passes conditions, but can't edit field
        ...(action === ContentActions.DELETE
          ? []
          : buildTestContent({
            editable_fields: [],
            ...conditions,
          })
        ),
        // can't edit field, and doesn't pass conditions
        ...buildTestContent({
          editable_fields: [],
          ...reversedConditions,
        }),
      ];
    }
    return content.map(commentOrPost => ([defaultMessage, commentOrPost]));
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
  });

  it.each(buildTestContent())(
    'can open drop down if enabled',
    async (commentOrPost) => {
      renderComponent(commentOrPost, { disabled: false });

      const openButton = await findOpenActionsDropdownButton();
      await act(async () => {
        fireEvent.click(openButton);
      });

      await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup'))
        .toBeInTheDocument());
    },
  );

  it.each(buildTestContent())(
    'can not open drop down if disabled',
    async (commentOrPost) => {
      renderComponent(commentOrPost, { disabled: true });

      const openButton = await findOpenActionsDropdownButton();
      await act(async () => {
        fireEvent.click(openButton);
      });

      await waitFor(() => expect(screen.queryByTestId('actions-dropdown-modal-popup'))
        .not
        .toBeInTheDocument());
    },
  );

  it.each(canPerformActionTestData)(
    // not using jest $variable notation because it's not working (probably a bug)
    'can perform action %s',
    async (defaultMessage, commentOrPost, action) => {
      const mockHandler = jest.fn();
      renderComponent(
        commentOrPost,
        { actionHandlers: { [action]: mockHandler } },
      );

      const openButton = await findOpenActionsDropdownButton();
      await act(async () => {
        fireEvent.click(openButton);
      });

      await waitFor(() => expect(screen.queryByText(defaultMessage))
        .toBeInTheDocument());

      await act(async () => {
        fireEvent.click(screen.queryByText(defaultMessage));
      });

      expect(mockHandler).toHaveBeenCalled();
    },
  );

  it.each(canNotPerformActionTestData)(
    // not using jest $variable notation because it's not working (probably a bug)
    'can not perform action %s',
    async (defaultMessage, commentOrPost) => {
      renderComponent(commentOrPost);

      const openButton = await findOpenActionsDropdownButton();
      await act(async () => {
        fireEvent.click(openButton);
      });

      await waitFor(() => expect(screen.queryByText(defaultMessage))
        .not
        .toBeInTheDocument());
    },
  );
});

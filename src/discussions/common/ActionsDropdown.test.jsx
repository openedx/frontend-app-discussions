import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import messages from '../messages';
import { ACTIONS_LIST } from '../utils';
import ActionsDropdown from './ActionsDropdown';

import '../posts/data/__factories__';
import '../comments/data/__factories__';

let store;

function renderComponent(commentOrPost, disabled = false) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <ActionsDropdown
          commentOrPost={commentOrPost}
          disabled={disabled}
          actionHandlers={({})}
        />
      </AppProvider>
    </IntlProvider>,
  );
}

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

describe('ActionsDropdown', () => {
  const findOpenActionsDropdownButton = async () => (
    screen.findByRole('button', { name: messages.actionsAlt.defaultMessage })
  );

  describe('as normal user', () => {
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

    it.each(
      // generate data for test to perform each action on each type of content
      ACTIONS_LIST
        .map(({ action, condition, label: { defaultMessage } }) => {
          const buildParams = {
            editable_fields: [action],
          };
          if (condition) {
            const [conditionName, conditionValue] = condition;
            buildParams[conditionName] = conditionValue;
          }
          return buildTestContent(buildParams)
            .map(commentOrPost => ([defaultMessage, commentOrPost]));
        })
        .flat(),
    )(
      // not using jest $variable notation because it's not working (probably a bug)
      'can perform action %s',
      async (defaultMessage, commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        await waitFor(() => expect(screen.queryByText(defaultMessage))
          .toBeInTheDocument());
      },
    );

    it.each(
      // generate data for test to perform each action on each type of content
      ACTIONS_LIST
        .map(({ action, condition, label: { defaultMessage } }) => {
          let content;
          if (!condition) {
            content = buildTestContent({
              editable_fields: [],
            });
          } else {
            content = [
              // can edit field, but doesn't pass condition
              ...buildTestContent({
                editable_fields: [action],
                [condition[0]]: !condition[1],
              }),
              // passes condition, but can't edit field
              ...buildTestContent({
                editable_fields: [],
                [condition[0]]: condition[1],
              }),
              // can't edit field, and doesn't pass condition
              ...buildTestContent({
                editable_fields: [],
                [condition[0]]: !condition[1],
              }),
            ];
          }
          return content.map(commentOrPost => ([defaultMessage, commentOrPost]));
        })
        .flat(),
    )(
      // not using jest $variable notation because it's not working (probably a bug)
      'can not perform action %s',
      async (defaultMessage, commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        await waitFor(() => expect(screen.queryByText(defaultMessage))
          .not
          .toBeInTheDocument());
      },
    );
  });

  describe('as administrator', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: true,
          roles: [],
        },
      });
    });

    it.each(
      buildTestContent({
        editable_fields: [],
        closed: false,
      }),
    )(
      'can close content even if not closeable',
      async (commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        const deleteAction = ACTIONS_LIST.find(action => action.id === 'close');
        await waitFor(() => expect(screen.queryByText(deleteAction.label.defaultMessage))
          .toBeInTheDocument());
      },
    );

    it.each(
      buildTestContent({
        editable_fields: [],
        closed: true,
      }),
    )(
      'can open content even if not openable',
      async (commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        const deleteAction = ACTIONS_LIST.find(action => action.id === 'reopen');
        await waitFor(() => expect(screen.queryByText(deleteAction.label.defaultMessage))
          .toBeInTheDocument());
      },
    );

    it.each(
      buildTestContent({
        editable_fields: [],
        pinned: false,
      }),
    )(
      'can pin content even if not pinnable',
      async (commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        const deleteAction = ACTIONS_LIST.find(action => action.id === 'pin');
        await waitFor(() => expect(screen.queryByText(deleteAction.label.defaultMessage))
          .toBeInTheDocument());
      },
    );

    it.each(
      buildTestContent({
        editable_fields: [],
        pinned: true,
      }),
    )(
      'can unpin content even if not unpinnable',
      async (commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        const deleteAction = ACTIONS_LIST.find(action => action.id === 'unpin');
        await waitFor(() => expect(screen.queryByText(deleteAction.label.defaultMessage))
          .toBeInTheDocument());
      },
    );

    it.each(
      buildTestContent({
        editable_fields: [],
      }),
    )(
      'can delete content even if not deletable',
      async (commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        const deleteAction = ACTIONS_LIST.find(action => action.id === 'delete');
        await waitFor(() => expect(screen.queryByText(deleteAction.label.defaultMessage))
          .toBeInTheDocument());
      },
    );
  });

  describe('as author', () => {
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

    it.each(
      buildTestContent({
        editable_fields: [],
        author: 'abc123',
      }),
    )(
      'can delete content even if not deletable',
      async (commentOrPost) => {
        renderComponent(commentOrPost);

        const openButton = await findOpenActionsDropdownButton();
        fireEvent.click(openButton);

        const deleteAction = ACTIONS_LIST.find(action => action.id === 'delete');
        await waitFor(() => expect(screen.queryByText(deleteAction.label.defaultMessage))
          .toBeInTheDocument());
      },
    );
  });
});

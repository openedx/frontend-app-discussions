import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { ThreadType } from '../../data/constants';
import { initializeStore } from '../../store';
import messages from '../comments/messages';
import AlertBanner from './AlertBanner';

import '../comments/data/__factories__';
import '../posts/data/__factories__';

let store;

function buildTestContent(type, buildParams) {
  const buildParamsSnakeCase = snakeCaseObject(buildParams);
  return camelCaseObject(Factory.build(type, { ...buildParamsSnakeCase }, null));
}

function renderComponent(
  content,
  postType,
) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <AlertBanner
          content={content}
          postType={postType}
        />
      </AppProvider>
    </IntlProvider>,
  );
}

describe.each([
  {
    label: 'flagged comment',
    type: 'comment',
    postType: ThreadType.QUESTION,
    props: { abuseFlagged: true },
    expectText: [messages.abuseFlaggedMessage.defaultMessage],
  },
  {
    label: 'Staff endorsed comment in a question thread',
    type: 'comment',
    postType: ThreadType.QUESTION,
    props: { endorsed: true, endorsedBy: 'test-user', endorsedByLabel: 'Staff' },
    expectText: [messages.answer.defaultMessage, messages.answeredLabel.defaultMessage, 'test-user', 'Staff'],
  },
  {
    label: 'TA endorsed comment in a question thread',
    type: 'comment',
    postType: ThreadType.QUESTION,
    props: { endorsed: true, endorsedBy: 'test-user', endorsedByLabel: 'Community TA' },
    expectText: [messages.answer.defaultMessage, messages.answeredLabel.defaultMessage, 'test-user', 'TA'],
  },
  {
    label: 'endorsed comment in a discussion thread',
    type: 'comment',
    postType: ThreadType.DISCUSSION,
    props: { endorsed: true, endorsedBy: 'test-user' },
    expectText: [messages.endorsed.defaultMessage, messages.endorsedLabel.defaultMessage, 'test-user'],
  },
  {
    label: 'flagged thread',
    type: 'thread',
    postType: null,
    props: { abuseFlagged: true },
    expectText: [messages.abuseFlaggedMessage.defaultMessage],
  },
  {
    label: 'edited content',
    type: 'thread',
    postType: null,
    props: { last_edit: { reason: 'test-reason', editorUsername: 'editor-user' } },
    expectText: [messages.editedBy.defaultMessage, messages.reason.defaultMessage, 'editor-user', 'test-reason'],
  },
])('AlertBanner', ({
  label, type, postType, props, expectText,
}) => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore({
      config: {
        userIsPrivileged: true,
        reasonCodesEnabled: true,
      },
    });
    const content = buildTestContent(type, props);
    renderComponent(content, postType);
  });

  it(`should show correct banner for a ${label}`, async () => {
    expectText.forEach(message => {
      expect(screen.queryAllByText(message, { exact: false }).length).toBeGreaterThan(0);
    });
  });
});

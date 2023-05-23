import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { camelCaseObject, initializeMockApp, snakeCaseObject } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { ThreadType } from '../../data/constants';
import { initializeStore } from '../../store';
import messages from '../post-comments/messages';
import { PostCommentsContext } from '../post-comments/postCommentsContext';
import { DiscussionContext } from './context';
import EndorsedAlertBanner from './EndorsedAlertBanner';

import '../post-comments/data/__factories__';
import '../posts/data/__factories__';

let store;

function buildTestContent(type, buildParams) {
  const buildParamsSnakeCase = snakeCaseObject(buildParams);
  return camelCaseObject(Factory.build(type, { ...buildParamsSnakeCase }, null));
}

function renderComponent(content, postType) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{ courseId: 'course-v1:edX+DemoX+Demo_Course' }}
        >
          <PostCommentsContext.Provider value={{
            postType,
          }}
          >
            <EndorsedAlertBanner
              endorsed={content.endorsed}
              endorsedAt={content.endorsedAt}
              endorsedBy={content.endorsedBy}
              endorsedByLabel={content.endorsedByLabel}
            />
          </PostCommentsContext.Provider>

        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

describe.each([
  {
    label: 'Staff endorsed comment in a question thread',
    type: 'comment',
    postType: ThreadType.QUESTION,
    props: { endorsed: true, endorsedBy: 'test-user', endorsedByLabel: 'Staff' },
    expectText: [messages.answer.defaultMessage, 'Staff'],
  },
  {
    label: 'TA endorsed comment in a question thread',
    type: 'comment',
    postType: ThreadType.QUESTION,
    props: { endorsed: true, endorsedBy: 'test-user', endorsedByLabel: 'Community TA' },
    expectText: [messages.answer.defaultMessage, 'TA'],
  },
  {
    label: 'endorsed comment in a discussion thread',
    type: 'comment',
    postType: ThreadType.DISCUSSION,
    props: { endorsed: true, endorsedBy: 'test-user' },
    expectText: [messages.endorsed.defaultMessage],
  },
])('EndorsedAlertBanner', ({
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
        hasModerationPrivileges: true,
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

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import DiscussionContext from '../common/context';
import { fetchConfigSuccess } from '../data/slices';
import messages from '../messages';
import DiscussionsRestrictionBanner from './DiscussionsRestrictionBanner';

let store;
let container;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
let activeStartDate = new Date();
activeStartDate.setDate(activeStartDate.getDate() - 2);
let activeEndDate = new Date();
activeEndDate.setDate(activeEndDate.getDate() + 2);
activeStartDate = activeStartDate.toISOString();
activeEndDate = activeEndDate.toISOString();

const getConfigData = (isPostingEnabled) => ({
  id: 'course-v1:edX+DemoX+Demo_Course',
  userRoles: ['Admin', 'Student'],
  hasModerationPrivileges: false,
  isGroupTa: false,
  isUserAdmin: false,
  isPostingEnabled,
});

function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId }}>
          <DiscussionsRestrictionBanner />
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
  return container;
}

describe('Discussions Restriction Banner', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: ['Student'],
      },
    });
  });

  test.each([
    { isPostingEnabled: false, visibility: true },
    { isPostingEnabled: true, visibility: false },
  ])('Test Discussions Restriction is visible on app load if posting is disabled', async ({ isPostingEnabled, visibility }) => {
    store = initializeStore();
    await store.dispatch(fetchConfigSuccess(getConfigData(isPostingEnabled)));
    renderComponent();
    if (visibility) {
      const element = await screen.findByRole('alert');
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent(messages.blackoutDiscussionInformation.defaultMessage);
    } else {
      const element = await screen.queryByRole('alert');
      expect(element).not.toBeInTheDocument();
    }
  });
});

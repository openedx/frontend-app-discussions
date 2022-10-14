import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { DiscussionContext } from '../common/context';
import { fetchConfigSuccess } from '../data/slices';
import messages from '../messages';
import BlackoutInformationBanner from './BlackoutInformationBanner';

let store;
let container;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
let activeStartDate = new Date();
activeStartDate.setDate(activeStartDate.getDate() - 2);
let activeEndDate = new Date();
activeEndDate.setDate(activeEndDate.getDate() + 2);
activeStartDate = activeStartDate.toISOString();
activeEndDate = activeEndDate.toISOString();

const getConfigData = (blackouts = []) => ({
  id: 'course-v1:edX+DemoX+Demo_Course',
  userRoles: ['Admin', 'Student'],
  hasModerationPrivileges: false,
  isGroupTa: false,
  isUserAdmin: false,
  blackouts,
});

function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId }}>
          <BlackoutInformationBanner />
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
  return container;
}

describe('Blackout Information Banner', () => {
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
    { blackouts: [], visibility: false },
    { blackouts: ['2021-12-31T10:15', '2021-12-31T10:20'], visibility: false },
    { blackouts: [{ start: activeStartDate, end: activeEndDate }], visibility: true },
    { blackouts: [{ start: activeEndDate, end: activeEndDate }], visibility: false },
  ])('Test Blackout Banner is visible on app load if blackout date is active', async ({ blackouts, visibility }) => {
    store = initializeStore();
    await store.dispatch(fetchConfigSuccess(getConfigData(blackouts)));
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

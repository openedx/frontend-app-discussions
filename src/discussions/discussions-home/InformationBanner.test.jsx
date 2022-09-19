import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { DiscussionContext } from '../common/context';
import { fetchConfigSuccess } from '../data/slices';
import messages from '../messages';
import InformationBanner from './InformationsBanner';

import '../posts/data/__factories__';

let store;
let container;
const courseId = 'course-v1:edX+DemoX+Demo_Course';

const getConfigData = (isAdmin = true, roles = []) => ({
  id: 'course-v1:edX+DemoX+Demo_Course',
  userRoles: roles,
  hasModerationPrivileges: false,
  isGroupTa: false,
  isUserAdmin: isAdmin,
});

function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId }}>
          <InformationBanner />
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
  return container;
}

describe('Information Banner learner view', () => {
  let element;
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: ['Student'],
      },
    });
    store = initializeStore();
    store.dispatch(fetchConfigSuccess(getConfigData(false, ['Student'])));
    renderComponent(true);
    element = await screen.findByRole('alert');
  });

  test('Test Banner is visible on app load', async () => {
    expect(element).toHaveTextContent(messages.bannerMessage.defaultMessage);
  });

  test('Test Banner do not have learn more button', async () => {
    expect(element).not.toHaveTextContent(messages.learnMoreBannerLink.defaultMessage);
  });
  test('Test Banner has share feedback button', async () => {
    expect(element).toHaveTextContent(messages.shareFeedback.defaultMessage);
  });
});

describe('Information Banner moderators/staff/admin view', () => {
  let element;
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
    store.dispatch(fetchConfigSuccess(getConfigData(true, ['Student', 'Moderator'])));
    renderComponent(true);
    element = await screen.findByRole('alert');
  });

  test('Test Banner is visible on app load', async () => {
    expect(element).toHaveTextContent(messages.bannerMessage.defaultMessage);
  });

  test('Test Banner has learn more button', async () => {
    expect(element).toHaveTextContent(messages.learnMoreBannerLink.defaultMessage);
  });
  test('Test Banner has share feedback button', async () => {
    expect(element).toHaveTextContent(messages.shareFeedback.defaultMessage);
  });
});

describe('User is redirected according to url according to role', () => {
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
  });

  test('TAs are redirected to learners feedback form', async () => {
    store.dispatch(fetchConfigSuccess(getConfigData(false, ['Student', 'Community TA'])));
    renderComponent(true);
    expect(screen.getByText(messages.shareFeedback.defaultMessage)
      .closest('a'))
      .toHaveAttribute('href', process.env.TA_FEEDBACK_FORM);
  });

  test('moderators/administrators are redirected to moderators feedback form', async () => {
    store.dispatch(fetchConfigSuccess(getConfigData(false, ['Student', 'Moderator', 'Administrator'])));
    renderComponent(true);
    expect(screen.getByText(messages.shareFeedback.defaultMessage)
      .closest('a'))
      .toHaveAttribute('href', process.env.STAFF_FEEDBACK_FORM);
  });

  test('user with only isAdmin true are redirected to moderators feedback form', async () => {
    store.dispatch(fetchConfigSuccess(getConfigData(true, ['Student'])));
    renderComponent(true);
    expect(screen.getByText(messages.shareFeedback.defaultMessage)
      .closest('a'))
      .toHaveAttribute('href', process.env.STAFF_FEEDBACK_FORM);
  });
});

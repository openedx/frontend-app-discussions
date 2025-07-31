import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getApiBaseUrl, Routes as ROUTES } from '../../data/constants';
import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import * as selectors from '../data/selectors';
import messages from '../messages';
import { showPostEditor } from '../posts/data';
import fetchCourseTopics from '../topics/data/thunks';
import EmptyTopics from './EmptyTopics';

import '../topics/data/__factories__';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;

function renderComponent(location = `/${courseId}/topics/`) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store} wrapWithRouter={false}>
          <MemoryRouter initialEntries={[location]}>
            <Routes>
              <Route path={ROUTES.TOPICS.ALL} element={<EmptyTopics />} />
              <Route path={ROUTES.TOPICS.TOPIC} element={<EmptyTopics />} />
            </Routes>
          </MemoryRouter>
        </AppProvider>
      </ResponsiveContext.Provider>
    </IntlProvider>,
  );
}

async function setupMockResponse() {
  const axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  axiosMock
    .onGet(topicsApiUrl)
    .reply(200, {
      courseware_topics: Factory.buildList('category', 2),
      non_courseware_topics: Factory.buildList('topic.withThreads', 3, {}, { topicPrefix: 'ncw' }),
    });
  await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
}

describe('EmptyTopics', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore({ config: { provider: 'legacy', onlyVerifiedUsersCanPost: true } });
  });

  test('"no topic selected" text shown when viewing topics page', async () => {
    renderComponent(`/${courseId}/topics/`);
    await screen.findByText(messages.emptyTitle.defaultMessage);
  });

  test('"no post selected" text shown when viewing a specific topic', async () => {
    await setupMockResponse();
    renderComponent(`/${courseId}/topics/ncwtopic-3/`);

    await screen.findByText(messages.noPostSelected.defaultMessage);
  });

  it('should open the confirmation link dialogue box.', async () => {
    renderComponent(`/${courseId}/topics/ncwtopic-3/`);

    const addPostButton = screen.getByRole('button', { name: 'Add a post' });
    await userEvent.click(addPostButton);

    expect(screen.queryByText('Send confirmation link')).toBeInTheDocument();
  });

  it('should dispatch showPostEditor when email confirmation is not required and user clicks "Add a post"', async () => {
    jest.spyOn(selectors, 'selectShouldShowEmailConfirmation').mockReturnValue(false);

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderComponent(`/${courseId}/topics/ncwtopic-1/`);

    const addPostButton = await screen.findByRole('button', { name: 'Add a post' });
    await userEvent.click(addPostButton);

    expect(dispatchSpy).toHaveBeenCalledWith(showPostEditor());
  });
});

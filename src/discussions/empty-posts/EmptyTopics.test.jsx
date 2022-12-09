import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { Context as ResponsiveContext } from 'react-responsive';
import { MemoryRouter } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getApiBaseUrl } from '../../data/constants';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import messages from '../messages';
import { fetchCourseTopics } from '../topics/data/thunks';
import EmptyTopics from './EmptyTopics';

import '../topics/data/__factories__';

let store;
const courseId = 'course-v1:edX+DemoX+Demo_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;

function renderComponent(location = `/${courseId}/topics/`) {
  return render(
    <IntlProvider locale="en">
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <AppProvider store={store}>
          <MemoryRouter initialEntries={[location]}>
            <EmptyTopics />
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

    store = initializeStore({ config: { provider: 'legacy' } });
  });

  test('"no topic selected" text shown when viewing topics page', async () => {
    renderComponent(`/${courseId}/topics/`);
    expect(screen.queryByText(messages.emptyTitle.defaultMessage))
      .toBeInTheDocument();
  });

  test('"no post selected" text shown when viewing a specific topic', async () => {
    await setupMockResponse();
    renderComponent(`/${courseId}/topics/ncwtopic-3/`);

    expect(screen.queryByText(messages.noPostSelected.defaultMessage))
      .toBeInTheDocument();
  });
});

import React from 'react';

import {
  fireEvent, render, screen, waitFor,
  within,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { PostActionsBar } from '../../components';
import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { DiscussionContext } from '../common/context';
import { getCourseConfigApiUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import { getUserProfileApiUrl, learnersApiUrl } from './data/api';
import { fetchLearners } from './data/thunks';
import LearnersView from './LearnersView';

import './data/__factories__';

let store;
let axiosMock;
const courseConfigApiUrl = getCourseConfigApiUrl();
const courseId = 'course-v1:edX+TestX+Test_Course';
let container;

async function renderComponent() {
  const wrapper = await render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{
          page: 'learners',
        }}
        >
          <MemoryRouter initialEntries={[`/${courseId}/`]}>
            <Route path="/:courseId/">
              <PostActionsBar />
              <LearnersView />
            </Route>
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
}

describe('Learners view test cases', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    Factory.resetAll();
  });

  async function setUpLearnerMockResponse(
    count = 3,
    pageSize = 6,
    page = 1,
    username = ['learner-1', 'learner-2', 'learner-3'],
    searchText,
  ) {
    Factory.resetAll();
    const learnersData = Factory.build('learnersResult', {}, {
      count,
      pageSize,
      page,
    });
    axiosMock.onGet(learnersApiUrl(courseId))
      .reply(() => [200, learnersData]);

    axiosMock.onGet(`${getUserProfileApiUrl()}?username=${username.join()}`)
      .reply(() => [200, Factory.build('learnersProfile', {}, {
        username,
      }).profiles]);
    await executeThunk(fetchLearners(courseId, { usernameSearch: searchText }), store.dispatch, store.getState);
  }

  async function assignPrivilages() {
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
      learners_tab_enabled: true,
      user_is_privileged: true,
    });
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  }

  it('Learners tab is disabled by default', async () => {
    await setUpLearnerMockResponse();
    await act(async () => {
      await renderComponent();
    });
    expect(screen.queryByText(/Last active/i)).toBeFalsy();
  });

  it('Learners tab is enabled', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages();
    await act(async () => {
      await renderComponent();
    });
  });

  it('Most activity should be selected by default for the non-moderator role.', async () => {
    await setUpLearnerMockResponse();
    await act(async () => {
      await renderComponent();
    });

    const filterBar = await container.querySelector('.collapsible-trigger');

    await act(async () => {
      fireEvent.click(filterBar);
    });

    await waitFor(async () => {
      const mostActivity = await screen.getByTestId('activity selected');

      expect(mostActivity).toBeInTheDocument();
    });
  });

  it.each([
    { searchBy: 'sort-recency', result: 0 },
    { searchBy: 'sort-activity', result: 3 },
  ])('Successfully display learners by %s.', async ({ searchBy, result }) => {
    await setUpLearnerMockResponse();
    await assignPrivilages();

    await act(async () => {
      await renderComponent();
    });

    const filterBar = await container.querySelector('.collapsible-trigger');
    await act(async () => {
      fireEvent.click(filterBar);
    });

    await waitFor(async () => {
      const activity = await container.querySelector(`#${searchBy}`);

      await act(async () => {
        fireEvent.click(activity);
      });
      await waitFor(async () => {
        const learners = await container.querySelectorAll('.discussion-post') ?? [];

        expect(learners).toHaveLength(result);
      });
    });
  });

  it('It should display a learner\'s list.', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages();

    await act(async () => {
      await renderComponent();
    });

    await waitFor(async () => {
      const learners = await container.querySelectorAll('.discussion-post') ?? [];
      const learnerAvatar = learners[0].querySelector('[alt=learner-1]');
      const learnerTitle = within(learners[0]).queryByText('learner-1');
      const stats = learners[0].querySelectorAll('.icon-size');

      expect(learners).toHaveLength(3);
      expect(learnerAvatar).toBeInTheDocument();
      expect(learnerTitle).toBeInTheDocument();
      expect(stats).toHaveLength(2);
    });
  });

  it.each([
    {
      searchText: 'hello world',
      output: 'Showing 0 results for',
      learnersCount: 0,
      username: [],
    },
    {
      searchText: 'learner',
      output: 'Showing 2 results for',
      learnersCount: 2,
      username:
        ['learner-1', 'learner-2'],
    },
  ])('It should have a search bar with a clear button and \'$output\' results found text.',
    async ({
      searchText, output, learnersCount, username,
    }) => {
      await setUpLearnerMockResponse();
      await assignPrivilages();
      await renderComponent();

      const searchField = await within(container).getByPlaceholderText('Search learners');
      const searchButton = await within(container).getByTestId('search-icon');
      await fireEvent.change(searchField, { target: { value: searchText } });
      await act(async () => {
        fireEvent.click(searchButton);
        await setUpLearnerMockResponse(learnersCount, learnersCount, 1, username, searchText);
      });

      await waitFor(async () => {
        const clearButton = within(container).queryByText('Clear results');
        const searchMessage = within(container).queryByText(`${output} "${searchText}"`);
        const units = container.querySelectorAll('.discussion-post') ?? [];

        expect(searchMessage).toBeInTheDocument();
        expect(clearButton).toBeInTheDocument();
        expect(units).toHaveLength(learnersCount);
      });
    });

  it('When click on the clear button it should move to a list of all learners.', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages();
    await renderComponent();

    const searchField = await within(container).getByPlaceholderText('Search learners');
    const searchButton = await within(container).getByTestId('search-icon');

    await fireEvent.change(searchField, { target: { value: 'learner' } });
    await act(async () => {
      fireEvent.click(searchButton);
      await setUpLearnerMockResponse(2, 2, 1, ['learner-1', 'learner-2'], 'learner');
    });

    await waitFor(async () => {
      const clearButton = await within(container).queryByText('Clear results');

      await act(async () => fireEvent.click(clearButton));
      await waitFor(async () => {
        await act(async () => {
          await setUpLearnerMockResponse();
        });
        await waitFor(async () => {
          const units = container.querySelectorAll('.discussion-post') ?? [];

          expect(units).toHaveLength(3);
        });
      });
    });
  });
});

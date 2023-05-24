/* eslint-disable default-param-last */
import React from 'react';

import {
  fireEvent, render, screen, waitFor, within,
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
import { getDiscussionsConfigUrl } from '../data/api';
import { fetchCourseConfig } from '../data/thunks';
import { getUserProfileApiUrl, learnersApiUrl } from './data/api';
import { fetchLearners } from './data/thunks';
import LearnersView from './LearnersView';

import './data/__factories__';

let store;
let axiosMock;
const courseId = 'course-v1:edX+TestX+Test_Course';
let container;

function renderComponent() {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{
          page: 'learners',
          learnerUsername: 'learner-1',
          courseId,
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

describe('LearnersView', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'test_user',
        administrator: true,
        roles: [],
        learnersTabEnabled: false,
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
    activeFlags,
    inactiveFlags,
  ) {
    Factory.resetAll();
    const learnersData = Factory.build('learnersResult', {}, {
      count,
      pageSize,
      page,
      activeFlags,
      inactiveFlags,
    });
    axiosMock.onGet(learnersApiUrl(courseId))
      .reply(() => [200, learnersData]);

    axiosMock.onGet(`${getUserProfileApiUrl()}?username=${username.join()}`)
      .reply(() => [200, Factory.build('learnersProfile', {}, {
        username,
      }).profiles]);
    await executeThunk(fetchLearners(courseId, { usernameSearch: searchText }), store.dispatch, store.getState);
  }

  async function assignPrivilages(hasModerationPrivileges = false) {
    axiosMock.onGet(getDiscussionsConfigUrl(courseId)).reply(200, {
      learners_tab_enabled: true,
      user_is_privileged: true,
      hasModerationPrivileges,
    });

    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  }

  test('Learners tab is disabled by default', async () => {
    await setUpLearnerMockResponse();
    await renderComponent();

    expect(screen.queryByText('learner-1')).not.toBeInTheDocument();
  });

  test('Learners tab is enabled', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages();
    await waitFor(() => {
      renderComponent();
    });

    expect(screen.queryByText('learner-1')).toBeInTheDocument();
  });

  test('Most activity should be selected by default for the non-moderator role.', async () => {
    await setUpLearnerMockResponse();
    await renderComponent();

    const filterBar = container.querySelector('.collapsible-trigger');

    await act(async () => {
      fireEvent.click(filterBar);
    });

    await waitFor(() => {
      const mostActivity = screen.getByTestId('activity selected');

      expect(mostActivity).toBeInTheDocument();
    });
  });

  it.each([
    { searchBy: 'sort-recency', result: 3 },
    { searchBy: 'sort-activity', result: 3 },
    { searchBy: 'sort-reported', result: 3 },
  ])('successfully display learners by %s.', async ({ searchBy, result }) => {
    await setUpLearnerMockResponse();
    await assignPrivilages(true);
    await renderComponent();

    const filterBar = container.querySelector('.collapsible-trigger');
    await act(async () => {
      fireEvent.click(filterBar);
    });

    await waitFor(async () => {
      const activity = container.querySelector(`#${searchBy}`);

      await act(async () => {
        fireEvent.click(activity);
      });
      await waitFor(() => {
        const learners = container.querySelectorAll('.discussion-post');

        expect(learners).toHaveLength(result);
      });
    });
  });

  it('should display a learner\'s list.', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages();
    await waitFor(() => {
      renderComponent();
    });

    const learners = await container.querySelectorAll('.discussion-post');
    const firstLearner = learners.item(0);
    const learnerAvatar = firstLearner.querySelector('[alt=learner-1]');
    const learnerTitle = within(firstLearner).queryByText('learner-1');
    const stats = firstLearner.querySelectorAll('.icon-size');

    expect(learners).toHaveLength(3);
    expect(learnerAvatar).toBeInTheDocument();
    expect(learnerTitle).toBeInTheDocument();
    expect(stats).toHaveLength(2);
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
  ])(
    'should have a search bar with a clear button and \'$output\' results found text.',
    async ({
      searchText, output, learnersCount, username,
    }) => {
      await setUpLearnerMockResponse();
      await assignPrivilages();
      await renderComponent();

      const searchField = within(container).getByPlaceholderText('Search learners');
      const searchButton = within(container).getByTestId('search-icon');

      await fireEvent.change(searchField, { target: { value: searchText } });
      await act(async () => {
        fireEvent.click(searchButton);
        setUpLearnerMockResponse(learnersCount, learnersCount, 1, username, searchText, 1);
      });

      await waitFor(() => {
        const clearButton = within(container).queryByText('Clear results');
        const searchMessage = within(container).queryByText(`${output} "${searchText}"`);
        const leaners = container.querySelectorAll('.discussion-post') ?? [];

        expect(searchMessage).toBeInTheDocument();
        expect(clearButton).toBeInTheDocument();
        expect(leaners).toHaveLength(learnersCount);
      });
    },
  );

  test('When click on the clear button it should move to a list of all learners.', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages(true);
    await renderComponent();

    const searchField = within(container).getByPlaceholderText('Search learners');
    const searchButton = within(container).getByTestId('search-icon');
    let clearButton;

    await fireEvent.change(searchField, { target: { value: 'learner' } });
    await act(async () => {
      fireEvent.click(searchButton);
      setUpLearnerMockResponse(2, 2, 1, ['learner-1', 'learner-2'], 'learner');
    });

    await waitFor(() => {
      clearButton = within(container).queryByText('Clear results');
    });
    await act(async () => fireEvent.click(clearButton));
    await waitFor(() => {
      setUpLearnerMockResponse();
    });

    const learners = container.querySelectorAll('.discussion-post');

    expect(learners).toHaveLength(3);
  });

  it(
    'should display reported and previously reported message by passing activeFlags or inactiveFlags',
    async () => {
      await setUpLearnerMockResponse(2, 2, 1, ['learner-1', 'learner-2'], '', 1, 1);
      await assignPrivilages(true);
      await renderComponent();
      await waitFor(() => container.querySelector('.text-danger'));

      const reportedIcon = container.querySelector('.text-danger');

      await act(async () => fireEvent.mouseEnter(reportedIcon));

      const reported = await screen.getByText('2 reported');
      const previouslyReported = screen.getByText('1 previously reported');

      expect(reportedIcon).toBeInTheDocument();
      expect(reported).toBeInTheDocument();
      expect(previouslyReported).toBeInTheDocument();
    },
  );

  it('should display load more button and display more learners by clicking on button.', async () => {
    await setUpLearnerMockResponse();
    await assignPrivilages(true);
    await renderComponent();

    await waitFor(() => container.querySelector('[data-testid="load-more-learners"]'));

    const loadMoreButton = container.querySelector('[data-testid="load-more-learners"]');

    await act(async () => {
      fireEvent.click(loadMoreButton);
    });

    expect(loadMoreButton).not.toBeInTheDocument();
    expect(container.querySelectorAll('.discussion-post')).toHaveLength(6);
  });
});

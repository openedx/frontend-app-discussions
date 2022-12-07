import React from 'react';

import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { getApiBaseUrl, Routes } from '../../../data/constants';
import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { fetchCourseTopics } from '../../topics/data/thunks';
import { LegacyBreadcrumbMenu } from '../index';

import '../../topics/data/__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v1/course_topics/${courseId}`;
let store;
let axiosMock;

function renderComponent(path) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Route
            path={[
              Routes.POSTS.PATH,
              Routes.TOPICS.CATEGORY,
            ]}
            component={LegacyBreadcrumbMenu}
          />
        </MemoryRouter>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('LegacyBreadcrumbMenu', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore({
      config: {
        provider: 'legacy',
      },
      blocks: {
        topics: {},
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const data = {
      courseware_topics: Factory.buildList('category', 3),
      non_courseware_topics: Factory.buildList('topic', 3),
    };
    axiosMock
      .onGet(topicsApiUrl)
      .reply(200, data);
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
  });

  it('shows the category dropdown with a category selected', async () => {
    renderComponent(`/${courseId}/category/category-1`);

    await waitFor(() => screen.findByText('category-1'));
    // The current category should be visible on the pagz
    const categoryDropdown = screen.queryByText('category-1');
    // Since a category is selected a subcategory dropdown should also be visible with "show all" selected by default
    const topicsDropdown = screen.queryByText('Show all');
    // A show all button should show up that lists topics in the current category
    expect(topicsDropdown).toBeInTheDocument();
    // Other categories should not be visible.
    expect(screen.queryByText('category-2')).not.toBeInTheDocument();

    // Click on the category dropdown.
    act(() => {
      fireEvent.click(categoryDropdown);
    });
    // Now other categories should be visible in the dropdown.
    expect(screen.queryByText('category-2')).toBeInTheDocument();
    // There are three categories but this has a length of 4 since the selected category name appears twice.
    expect(screen.queryAllByText('category-', { exact: false })).toHaveLength(4);

    // Now click on the topics dropdown
    act(() => {
      fireEvent.click(topicsDropdown);
    });
    // Topics in the category should be visible.
    expect(screen.queryAllByText('category-1-topic', { exact: false })).toHaveLength(4);
  });

  it('shows the category correct dropdown labels with a topic selected', async () => {
    renderComponent(`/${courseId}/topics/category-2-topic-1`);

    // Since a topic is selected, we have both a category and topic, so "show all shouldn't be visible"
    expect(screen.queryByText('Show all')).not.toBeInTheDocument();
    // The name of the category and topic should be visible.
    expect(screen.queryByText('category-2')).toBeInTheDocument();
    expect(screen.queryByText('category-2-topic 1')).toBeInTheDocument();
  });
});

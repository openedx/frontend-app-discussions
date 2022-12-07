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

import { getBlocksAPIResponse } from '../../../data/__factories__';
import { getBlocksAPIURL } from '../../../data/api';
import { getApiBaseUrl, Routes } from '../../../data/constants';
import { fetchCourseBlocks } from '../../../data/thunks';
import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { DiscussionContext } from '../../common/context';
import { fetchCourseTopics } from '../../topics/data/thunks';
import { BreadcrumbMenu } from '../index';

import '../../topics/data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const topicsApiUrl = `${getApiBaseUrl()}/api/discussion/v2/course_topics/${courseId}`;
let store;
let axiosMock;

function renderComponent(path, topicId = null, category = null) {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider
          value={{
            courseId,
            topicId,
            category,
          }}
        >
          <MemoryRouter initialEntries={[path]}>
            <Route
              path={[
                Routes.POSTS.PATH,
                Routes.TOPICS.CATEGORY,
              ]}
              component={BreadcrumbMenu}
            />
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

describe('BreadcrumbMenu', () => {
  let blocksAPIResponse;
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
        provider: 'openedx',
      },
      blocks: {
        topics: {},
      },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    blocksAPIResponse = getBlocksAPIResponse();
    axiosMock.onGet(getBlocksAPIURL())
      .reply(200, blocksAPIResponse);
    await executeThunk(fetchCourseBlocks(courseId, 'test-user'), store.dispatch, store.getState);
    const data = [
      ...Factory.buildList('topic.v2', 3, { usage_key: null }, { topicPrefix: 'ncw' }),
      Factory.build('topic.v2', { id: 'vertical_0270f6de40fc' }),
      Factory.build('topic.v2', { id: '867dddb6f55d410caaa9c1eb9c6743ec' }),
      Factory.build('topic.v2', { id: '4f6c1b4e316a419ab5b6bf30e6c708e9' }),
    ];
    axiosMock
      .onGet(topicsApiUrl)
      .reply(200, data);
    await executeThunk(fetchCourseTopics(courseId), store.dispatch, store.getState);
  });

  it('shows the category dropdown with a category selected', async () => {
    const chapterKey = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@d8a6192ade314473a78242dfeedfbf5b';
    const sectionKey = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@edx_introduction';

    renderComponent(`/${courseId}/category/${chapterKey}`, null, chapterKey);

    await waitFor(() => screen.findByText(blocksAPIResponse.blocks[chapterKey].display_name));

    const chapterDropdown = screen.queryByText(blocksAPIResponse.blocks[chapterKey].display_name);
    // Since a category is selected a subcategory dropdown should also be visible with "show all" selected by default
    const sectionDropdown = screen.queryByRole('button', { name: 'Show all' });
    // A show all button should show up that lists topics in the current category
    expect(sectionDropdown)
      .toBeInTheDocument();
    // Other categories should not be visible.
    expect(screen.queryByText(blocksAPIResponse.blocks[sectionKey].display_name))
      .not
      .toBeInTheDocument();

    // Click on the category dropdown.
    act(() => {
      fireEvent.click(chapterDropdown);
    });
    // Now other categories should be visible in the dropdown.
    expect(screen.queryByText(blocksAPIResponse.blocks[chapterKey].display_name))
      .toBeInTheDocument();
    // There are 4 categories but this has a length of 5 since there is also a link to show all.
    expect(screen.queryAllByRole('link', { exact: false }))
      .toHaveLength(5);

    // Now click on the topics dropdown
    act(() => {
      fireEvent.click(sectionDropdown);
    });

    // Topics in the category should be visible.
    expect(screen.queryByRole('link', { name: 'Demo Course Overview' }))
      .toBeInTheDocument();
  });

  it('shows the category correct dropdown labels with a topic selected', async () => {
    const topicId = 'vertical_0270f6de40fc';
    renderComponent(`/${courseId}/topics/${topicId}`, topicId);
    // Since a topic is selected, we have both a category and topic, so "show all shouldn't be visible"
    expect(screen.queryByText('Show all'))
      .not
      .toBeInTheDocument();
    // The name of the category and topic should be visible.
    expect(await screen.findByRole('button', { name: 'Introduction' }))
      .toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Demo Course Overview' }))
      .toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Introduction: Video and Sequences' }))
      .toBeInTheDocument();
  });
});

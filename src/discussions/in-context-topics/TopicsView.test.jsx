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

import { initializeStore } from '../../store';
import { executeThunk } from '../../test-utils';
import { DiscussionContext } from '../common/context';
import { getCourseTopicsApiUrl } from './data/api';
import { selectCoursewareTopics, selectNonCoursewareTopics } from './data/selectors';
import { fetchCourseTopicsV3 } from './data/thunks';
import TopicPostsView from './TopicPostsView';
import TopicsView from './TopicsView';

import './data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
const category = 'section-topic-1';

const topicsApiUrl = `${getCourseTopicsApiUrl()}`;
let store;
let axiosMock;
let lastLocation;
let component;
let container;
function renderComponent() {
  component = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId, category }}>
          <MemoryRouter initialEntries={[`/${courseId}/topics/`]}>
            <Route path="/:courseId/topics/">
              <TopicsView />
            </Route>
            <Route path="/:courseId/category/:category">
              <TopicPostsView />
            </Route>
            <Route
              render={({ location }) => {
                lastLocation = location;
                return null;
              }}
            />
          </MemoryRouter>
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
  container = component.container;
  return container;
}

describe('Legacy Topics View', () => {
  let nonCoursewareTopics;
  let coursewareTopics;
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore({
      config: { enableInContext: true, provider: 'openedx', hasModerationPrivileges: true },
    });
    Factory.resetAll();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    lastLocation = undefined;
  });

  async function setupMockResponse() {
    axiosMock.onGet(`${topicsApiUrl}${courseId}`)
      .reply(200, (Factory.buildList('topic', 1, null, {
        topicPrefix: 'noncourseware-topic',
        enabledInContext: true,
        topicNamePrefix: 'general-topic',
        usageKey: '',
        courseware: false,
        discussionCount: 1,
        questionCount: 1,
      }).concat(Factory.buildList('section', 2, null, { topicPrefix: 'courseware' })))
        .concat(Factory.buildList('archived-topics', 2, null)));
    await executeThunk(fetchCourseTopicsV3(courseId), store.dispatch, store.getState);

    const state = store.getState();
    nonCoursewareTopics = selectNonCoursewareTopics(state);
    coursewareTopics = selectCoursewareTopics(state);
  }

  it('A non-courseware topic should be clickable and should have a title', async () => {
    await setupMockResponse();
    renderComponent();

    nonCoursewareTopics.forEach(async topic => {
      const noncoursewareTopic = await screen.findByText(topic.name);

      await act(async () => fireEvent.click(noncoursewareTopic));
      await waitFor(async () => {
        expect(screen.queryByText(topic.name)).toBeInTheDocument();
        expect(lastLocation.pathname.endsWith(`/topics/${topic.id}`)).toBeTruthy();
      });
    });
  });

  it('A non-courseware topic should be on the top of the list', async () => {
    await setupMockResponse();
    renderComponent();
    const topicsList = await screen.getByRole('list');
    const { firstChild } = topicsList;
    expect(within(firstChild).queryByText(nonCoursewareTopics[0].name)).toBeInTheDocument();
    expect(topicsList.children[1]).toBe(topicsList.querySelector('.divider'));
  });

  it('A non-Courseware topic should have 3 stats and should be hoverable', async () => {
    await setupMockResponse();
    renderComponent();
    const topicsList = await screen.getByRole('list');
    const { firstChild } = topicsList;
    const statsList = await firstChild.getElementsByClassName('pgn__icon');

    expect(statsList.length).toBe(3);
    fireEvent.mouseOver(statsList[0]);
    expect(screen.queryByText('1 Discussion')).toBeInTheDocument();
  });

  it('Section groups should be listed in the middle of the topics list.', async () => {
    await setupMockResponse();
    renderComponent();
    const topicsList = await screen.getByRole('list');
    const sectionGroups = await screen.getAllByTestId('section-group');

    expect(topicsList.children[1]).toStrictEqual(topicsList.querySelector('.divider'));
    expect(sectionGroups.length).toBe(2);
    expect(topicsList.children[5]).toStrictEqual(topicsList.querySelector('.divider'));
  });

  it('A section group should have only a title and required subsections.', async () => {
    await setupMockResponse();
    renderComponent();
    const sectionGroups = await screen.getAllByTestId('section-group');
    coursewareTopics.forEach(async (topic, index) => {
      const statsList = await sectionGroups[index].getElementsByClassName('pgn__icon');
      const subsectionGroups = await within(sectionGroups[index]).getAllByTestId('subsection-group');

      expect(within(sectionGroups[index]).queryByText(topic.displayName)).toBeInTheDocument();
      expect(statsList).toHaveLength(0);
      expect(subsectionGroups).toHaveLength(2);
    });
  });

  it('The subsection should have a title name, be clickable, and not have the stats', async () => {
    await setupMockResponse();
    renderComponent();
    const subSection = await container.querySelector(`[data-subsection-id=${coursewareTopics[0].children[0].id}]`);
    const subSectionTitleContainer = await within(subSection).queryByText(coursewareTopics[0].children[0].displayName);
    const statsList = await subSection.getElementsByClassName('pgn__icon');

    expect(subSectionTitleContainer).toBeInTheDocument();
    expect(statsList).toHaveLength(0);
  });

  it('Subsection names should be clickable and redirected to the units lists', async () => {
    await setupMockResponse();
    renderComponent();

    const subSection = await container.querySelector(`[data-subsection-id=${coursewareTopics[0].children[0].id}]`);
    await act(async () => fireEvent.click(subSection));
    await waitFor(async () => {
      const backButton = await screen.getByLabelText('Back to topics list');
      const topicsList = await screen.getByRole('list');
      const subSectionHeadingContainer = await screen.findByText(coursewareTopics[0].children[0].displayName);
      const units = await topicsList.getElementsByClassName('discussion-topic');

      expect(backButton).toBeInTheDocument();
      expect(subSectionHeadingContainer).toBeInTheDocument();
      expect(units).toHaveLength(4);
      expect(lastLocation.pathname.endsWith(`/category/${coursewareTopics[0].children[0].id}`)).toBeTruthy();
    });
  });

  it('The number of units should be matched with the actual unit length.', async () => {
    await setupMockResponse();
    renderComponent();
    const subSection = await container.querySelector(`[data-subsection-id=${coursewareTopics[0].children[0].id}]`);

    await act(async () => fireEvent.click(subSection));
    await waitFor(async () => {
      const units = await container.getElementsByClassName('discussion-topic');

      expect(units).toHaveLength(4);
    });
  });

  it('A unit should have a title and stats and should be clickable', async () => {
    await setupMockResponse();
    renderComponent();
    const unit = coursewareTopics[0].children[0].children[0];
    const subSection = await container.querySelector(`[data-subsection-id=${coursewareTopics[0].children[0].id}]`);

    await act(async () => fireEvent.click(subSection));
    await waitFor(async () => {
      const ele = await screen.findByText(unit.name);
      const unitContainer = await container.querySelector(`[data-topic-id=${unit.id}]`);
      const statsList = await unitContainer.getElementsByClassName('pgn__icon');

      expect(ele).toBeInTheDocument();
      expect(statsList).toHaveLength(3);

      await act(async () => fireEvent.click(unitContainer));
      await waitFor(async () => {
        expect(lastLocation.pathname.endsWith(`/topics/${unit.id}`)).toBeTruthy();
      });
    });
  });
});

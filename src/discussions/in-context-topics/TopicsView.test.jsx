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
let container;

function renderComponent() {
  const wrapper = render(
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
  container = wrapper.container;
}

describe('InContext Topics View', () => {
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

    const nonCourseware = nonCoursewareTopics[0];
    const nonCoursewareTopic = await screen.findByText(nonCourseware.name);

    await act(async () => {
      fireEvent.click(nonCoursewareTopic);
    });
    await waitFor(() => {
      expect(screen.queryByText(nonCourseware.name)).toBeInTheDocument();
      expect(lastLocation.pathname.endsWith(`/topics/${nonCourseware.id}`)).toBeTruthy();
    });
  });

  it('A non-courseware topic should be on the top of the list', async () => {
    await setupMockResponse();
    renderComponent();
    const topic = await container.querySelector('.discussion-topic');

    expect(within(topic).queryByText('general-topic-1')).toBeInTheDocument();
    expect(topic.nextSibling).toBe(container.querySelector('.divider'));
  });

  it('A non-Courseware topic should have 3 stats and should be hoverable', async () => {
    await setupMockResponse();
    renderComponent();

    const topic = await container.querySelector('.discussion-topic');
    const statsList = await topic.querySelectorAll('.icon-size');

    expect(statsList.length).toBe(3);
    await act(async () => { fireEvent.mouseOver(statsList[0]); });
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
      const stats = await sectionGroups[index].querySelectorAll('.icon-size:not([data-testid="subsection-group"].icon-size)');
      const subsectionGroups = await within(sectionGroups[index]).getAllByTestId('subsection-group');

      expect(within(sectionGroups[index]).queryByText(topic.displayName)).toBeInTheDocument();
      expect(stats).toHaveLength(0);
      expect(subsectionGroups).toHaveLength(2);
    });
  });

  it('The subsection should have a title name, be clickable, and have the stats', async () => {
    await setupMockResponse();
    renderComponent();
    const subsectionObject = coursewareTopics[0].children[0];
    const subSection = await container.querySelector(`[data-subsection-id=${subsectionObject.id}]`);
    const subSectionTitle = await within(subSection).queryByText(subsectionObject.displayName);
    const statsList = await subSection.querySelectorAll('.icon-size');

    expect(subSectionTitle).toBeInTheDocument();
    expect(statsList).toHaveLength(2);
  });

  it('Subsection names should be clickable and redirected to the units lists', async () => {
    await setupMockResponse();
    renderComponent();

    const subsectionObject = coursewareTopics[0].children[0];
    const subSection = await container.querySelector(`[data-subsection-id=${subsectionObject.id}]`);

    await act(async () => { fireEvent.click(subSection); });
    await waitFor(async () => {
      const backButton = await screen.getByLabelText('Back to topics list');
      const topicsList = await screen.getByRole('list');
      const subSectionHeading = await screen.findByText(subsectionObject.displayName);
      const units = await topicsList.querySelectorAll('.discussion-topic');

      expect(backButton).toBeInTheDocument();
      expect(subSectionHeading).toBeInTheDocument();
      expect(units).toHaveLength(4);
      expect(lastLocation.pathname.endsWith(`/category/${subsectionObject.id}`)).toBeTruthy();
    });
  });

  it('The number of units should be matched with the actual unit length.', async () => {
    await setupMockResponse();
    renderComponent();
    const subSection = await container.querySelector(`[data-subsection-id=${coursewareTopics[0].children[0].id}]`);

    await act(async () => { fireEvent.click(subSection); });
    await waitFor(async () => {
      const units = await container.querySelectorAll('.discussion-topic');

      expect(units).toHaveLength(4);
    });
  });

  it('A unit should have a title and stats and should be clickable', async () => {
    await setupMockResponse();
    renderComponent();
    const subSectionObject = coursewareTopics[0].children[0];
    const unitObject = subSectionObject.children[0];

    const subSection = await container.querySelector(`[data-subsection-id=${subSectionObject.id}]`);

    await act(async () => { fireEvent.click(subSection); });
    await waitFor(async () => {
      const unitElement = await screen.findByText(unitObject.name);
      const unitContainer = await container.querySelector(`[data-topic-id=${unitObject.id}]`);
      const statsList = await unitContainer.querySelectorAll('.icon-size');

      expect(unitElement).toBeInTheDocument();
      expect(statsList).toHaveLength(3);

      await act(async () => { fireEvent.click(unitContainer); });
      await waitFor(async () => {
        expect(lastLocation.pathname.endsWith(`/topics/${unitObject.id}`)).toBeTruthy();
      });
    });
  });
});

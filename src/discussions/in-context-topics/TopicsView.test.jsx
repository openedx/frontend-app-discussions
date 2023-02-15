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
import TopicsView from './TopicsView';

import './data/__factories__';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const topicsApiUrl = `${getCourseTopicsApiUrl()}`;
let store;
let axiosMock;
let lastLocation;
let component;
let debug;

function renderComponent() {
  component = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId }}>
          <MemoryRouter initialEntries={[`/${courseId}/topics/`]}>
            <Route path="/:courseId/topics/">
              <TopicsView />
            </Route>
            <Route path="/:courseId/category/:category">
              <TopicsView />
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
  debug = component.debug;
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
      expect(screen.queryByText(topic.name)).toBeInTheDocument();
      const noncoursewareTopic = await screen.findByText(topic.name);
      fireEvent.click(noncoursewareTopic);
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

    fireEvent.mouseOver(statsList[0]);

    expect(statsList.length).toBe(3);
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
    const sectionGroups = await screen.getAllByTestId('section-group');
    coursewareTopics.forEach(async (topic, index) => {
      const subsectionGroups = await within(sectionGroups[index]).getAllByTestId('subsection-group');
      topic.children.forEach(async (subsection, i) => {
        const statsList = await subsectionGroups[i].getElementsByClassName('pgn__icon');

        expect(await within(subsectionGroups[i]).queryByText(subsection.displayName)).toBeInTheDocument();
        const subsectionTopic = await screen.findByText(subsection.displayName);
        fireEvent.click(subsectionTopic);
        expect(statsList).toHaveLength(0);
      });
    });
  });

  it('Subsection names should be clickable and redirected to the units lists', async () => {
    await setupMockResponse();
    renderComponent();
    const subsectionGroup = await screen.getAllByTestId('subsection-group');

    await act(async () => {
      fireEvent.click(subsectionGroup[0]);
      // debug();
    });
    await waitFor(async () => {
      debug();
      // expect(screen.queryByText(coursewareTopics[0].children[0].name)).toBeInTheDocument();
      // const backButton = screen.getByRole('button', { type: 'button' });
      // expect(backButton).toBeInTheDocument();
      // const ele = await screen.getByLabelText('Back to topics list');
      // expect(ele).toBeInTheDocument();
    });
  });
});

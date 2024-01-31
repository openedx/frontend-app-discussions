import { render } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';
import { Factory } from 'rosie';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import executeThunk from '../../test-utils';
import DiscussionContext from '../common/context';
import { getCourseConfigApiUrl } from './api';
import { useCurrentDiscussionTopic, useUserPostingEnabled } from './hooks';
import fetchCourseConfig from './thunks';

const courseId = 'course-v1:edX+TestX+Test_Course';
const courseConfigApiUrl = getCourseConfigApiUrl();
let store;
let axiosMock;

const generateApiResponse = (isPostingEnabled, isCourseAdmin = false) => ({
  isPostingEnabled,
  hasModerationPrivileges: false,
  isGroupTa: false,
  isCourseAdmin,
  isCourseStaff: false,
  isUserAdmin: false,
});

describe('Hooks', () => {
  describe('useCurrentDiscussionTopic', () => {
    const ComponentWithHook = () => {
      const topic = useCurrentDiscussionTopic();
      return (
        <div>
          {String(topic)}
        </div>
      );
    };

    function renderComponent({ topicId, category }) {
      return render(
        <IntlProvider locale="en">
          <AppProvider store={store}>
            <DiscussionContext.Provider
              value={{
                topicId,
                category,
              }}
            >
              <ComponentWithHook />
            </DiscussionContext.Provider>
          </AppProvider>
        </IntlProvider>,
      );
    }

    beforeEach(() => {
      initializeMockApp();
      store = initializeStore({
        blocks: {
          blocks: {
            'some-unit-key': { topics: ['some-topic-0'], parent: 'some-sequence-key' },
            'some-sequence-key': { topics: ['some-topic-0'] },
            'another-sequence-key': { topics: ['some-topic-1', 'some-topic-2'] },
            'empty-key': { topics: [] },
          },
        },
        config: { provider: 'openedx' },
      });
    });

    test('when topicId is in context', () => {
      const { queryByText } = renderComponent({ topicId: 'some-topic' });
      expect(queryByText('some-topic')).toBeInTheDocument();
    });

    test('when the category is a unit', () => {
      const { queryByText } = renderComponent({ category: 'some-unit-key' });
      expect(queryByText('some-topic-0')).toBeInTheDocument();
    });

    test('when the category is a sequence with one unit', () => {
      const { queryByText } = renderComponent({ category: 'some-sequence-key' });
      expect(queryByText('some-topic-0')).toBeInTheDocument();
    });

    test('when the category is a sequence with multiple units', () => {
      const { queryByText } = renderComponent({ category: 'another-sequence-key' });
      expect(queryByText('null')).toBeInTheDocument();
    });

    test('when the category is invalid', () => {
      const { queryByText } = renderComponent({ category: 'invalid-key' });
      expect(queryByText('null')).toBeInTheDocument();
    });

    test('when the category has no topics', () => {
      const { queryByText } = renderComponent({ category: 'empty-key' });
      expect(queryByText('null')).toBeInTheDocument();
    });
  });

  describe('useUserPostingEnabled', () => {
    const ComponentWithHook = () => {
      const isUserPrivilegedInPostingRestriction = useUserPostingEnabled();
      return (
        <div>
          {String(isUserPrivilegedInPostingRestriction)}
        </div>
      );
    };

    function renderComponent() {
      return render(
        <IntlProvider locale="en">
          <AppProvider store={store}>
            <ComponentWithHook />
          </AppProvider>
        </IntlProvider>,
      );
    }
    describe('User can add Thread in Posting Restrictions ', () => {
      beforeEach(() => {
        initializeMockApp({
          authenticatedUser: {
            userId: 3,
            username: 'abc123',
            administrator: true,
            roles: [],
          },
        });
        axiosMock = new MockAdapter(getAuthenticatedHttpClient());
        Factory.resetAll();
        store = initializeStore();
      });

      test('when posting is not disabled and Role is Learner return true', async () => {
        axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`)
          .reply(200, generateApiResponse(true, false));
        await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
        const { queryByText } = renderComponent();
        expect(queryByText('true')).toBeInTheDocument();
      });

      test('when posting is not disabled and Role is not Learner return true', async () => {
        axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`)
          .reply(200, generateApiResponse(true, true));
        await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
        const { queryByText } = renderComponent();
        expect(queryByText('true')).toBeInTheDocument();
      });

      test('when posting is disabled and Role is Learner return false', async () => {
        axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`)
          .reply(200, generateApiResponse(false, false));
        await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
        const { queryByText } = renderComponent();
        expect(queryByText('false')).toBeInTheDocument();
      });

      test('when posting is not disabled and Role is not Learner return true', async () => {
        axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`)
          .reply(200, generateApiResponse(false, true));
        await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
        const { queryByText } = renderComponent();
        expect(queryByText('true')).toBeInTheDocument();
      });
    });
  });
});

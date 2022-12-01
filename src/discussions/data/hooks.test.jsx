import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { DiscussionContext } from '../common/context';
import { useCurrentDiscussionTopic, useUserCanAddThreadInBlackoutDate } from './hooks';

let store;

initializeMockApp();
describe('Hooks', () => {
  describe('useCurrentDiscussionTopic', () => {
    function ComponentWithHook() {
      const topic = useCurrentDiscussionTopic();
      return (
        <div>
          {String(topic)}
        </div>
      );
    }

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

  describe('useUserCanAddThreadInBlackoutDate', () => {
    function ComponentWithHook() {
      const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();
      return (
        <div>
          {String(userCanAddThreadInBlackoutDate)}
        </div>
      );
    }

    function renderComponent() {
      return render(
        <IntlProvider locale="en">
          <AppProvider store={store}>
            <ComponentWithHook />
          </AppProvider>
        </IntlProvider>,
      );
    }
    describe('blackout dates are not active', () => {
      beforeEach(async () => {
        store = initializeStore({
          config: {
            blackouts: [],
            hasModerationPrivileges: false,
            isGroupTa: false,
            isCourseAdmin: false,
            isCourseStaff: false,
            isUserAdmin: false,
          },
        });
      });
      test('return true when blackout dates are not active and Role is Learner', () => {
        const { queryByText } = renderComponent();
        expect(queryByText('true')).toBeInTheDocument();
      });
    });

    describe('blackout dates are active', () => {
      beforeEach(async () => {
        store = initializeStore({
          config: {
            blackouts: [{ start: '2022-11-25T00:00:00Z', end: '2050-11-25T23:59:00Z' }],
            hasModerationPrivileges: false,
            isGroupTa: false,
            isCourseAdmin: false,
            isCourseStaff: false,
            isUserAdmin: false,
          },
        });
      });

      test('return false when blackout dates are active and Role is Learner', async () => {
        const { queryByText } = renderComponent();
        expect(queryByText('false')).toBeInTheDocument();
      });
    });
    describe('blackout dates are active And role is other than Leaner', () => {
      beforeEach(async () => {
        store = initializeStore({
          config: {
            blackouts: [{ start: '2022-11-25T00:00:00Z', end: '2050-11-25T23:59:00Z' }],
            hasModerationPrivileges: false,
            isGroupTa: false,
            isCourseAdmin: true,
            isCourseStaff: false,
            isUserAdmin: false,
          },
        });
      });

      test('return true when blackout dates are active and Role is not Learner', async () => {
        const { queryByText } = renderComponent();
        expect(queryByText('true')).toBeInTheDocument();
      });
    });
    describe('blackout dates are not active And role is other than Leaner', () => {
      beforeEach(async () => {
        store = initializeStore({
          config: {
            blackouts: [],
            hasModerationPrivileges: false,
            isGroupTa: false,
            isCourseAdmin: true,
            isCourseStaff: false,
            isUserAdmin: false,
          },
        });
      });

      test('return true when blackout dates are not active and Role is not Learner', async () => {
        const { queryByText } = renderComponent();
        expect(queryByText('true')).toBeInTheDocument();
      });
    });
  });
});

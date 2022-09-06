import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../store';
import { DiscussionContext } from '../common/context';
import { useCurrentDiscussionTopic } from './hooks';

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
});

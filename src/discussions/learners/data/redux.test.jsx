import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { setupLearnerMockResponse } from '../test-utils';
import { setPostFilter, setSortedBy, setUsernameSearch } from './slices';
import { fetchLearners } from './thunks';

import './__factories__';

let axiosMock;
let store;

describe('Learner redux test cases', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    Factory.resetAll();
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test('Successfully load initial states in redux', async () => {
    executeThunk(
      fetchLearners('course-v1:edX+DemoX+Demo_Course', { usernameSearch: 'learner-1' }),
      store.dispatch,
      store.getState,
    );
    const { learners } = store.getState();

    expect(learners.status).toEqual('in-progress');
    expect(learners.learnerProfiles).toEqual({});
    expect(learners.pages).toHaveLength(0);
    expect(learners.nextPage).toBeNull();
    expect(learners.totalPages).toBeNull();
    expect(learners.totalLearners).toBeNull();
    expect(learners.sortedBy).toEqual('activity');
    expect(learners.usernameSearch).toBeNull();
    expect(learners.postFilter.postType).toEqual('all');
    expect(learners.postFilter.status).toEqual('statusAll');
    expect(learners.postFilter.orderBy).toEqual('lastActivityAt');
    expect(learners.postFilter.cohort).toEqual('');
  });

  test(
    'Successfully store a learner posts stats data as pages object in redux',
    async () => {
      const learners = await setupLearnerMockResponse();
      const page = learners.pages[0];
      const statsObject = page[0];

      expect(page).toHaveLength(3);
      expect(statsObject.responses).toEqual(3);
      expect(statsObject.threads).toEqual(1);
      expect(statsObject.replies).toEqual(0);
    },
  );

  test(
    'Successfully store the nextPage, totalPages, totalLearners, and sortedBy data in redux',
    async () => {
      const learners = await setupLearnerMockResponse();

      expect(learners.nextPage).toEqual(2);
      expect(learners.totalPages).toEqual(2);
      expect(learners.totalLearners).toEqual(3);
      expect(learners.sortedBy).toEqual('activity');
    },
  );

  test('Successfully updated the learner\'s sort data in redux', async () => {
    const learners = await setupLearnerMockResponse();

    expect(learners.sortedBy).toEqual('activity');
    expect(learners.pages[0]).toHaveLength(3);

    await store.dispatch(setSortedBy('recency'));
    const updatedLearners = store.getState().learners;

    expect(updatedLearners.sortedBy).toEqual('recency');
    expect(updatedLearners.pages).toHaveLength(0);
  });

  test('Successfully updated the post-filter data in redux', async () => {
    const learners = await setupLearnerMockResponse();
    const filter = {
      ...learners.postFilter,
      postType: 'discussion',
    };

    expect(learners.postFilter.postType).toEqual('all');

    await store.dispatch(setPostFilter(filter));
    const updatedLearners = store.getState().learners;

    expect(updatedLearners.postFilter.postType).toEqual('discussion');
    expect(updatedLearners.pages).toHaveLength(0);
  });

  test(
    'Successfully update the learner\'s search query in redux when searching for a learner',
    async () => {
      const learners = await setupLearnerMockResponse();

      expect(learners.usernameSearch).toBeNull();

      await store.dispatch(setUsernameSearch('learner-2'));
      const updatedLearners = store.getState().learners;

      expect(updatedLearners.usernameSearch).toEqual('learner-2');
    },
  );
});

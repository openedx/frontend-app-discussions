import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { RequestStatus } from '../../../data/constants';
import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getDiscussionTourUrl } from './api';
import selectTours from './selectors';
import {
  discussionsTourRequest,
  discussionsToursRequestError,
  fetchUserDiscussionsToursSuccess,
  updateUserDiscussionsTourByName,
  updateUserDiscussionsTourSuccess,
} from './slices';
import { fetchDiscussionTours, updateTourShowStatus } from './thunks';
import discussionTourFactory from './tours.factory';

const url = getDiscussionTourUrl();
let actualActions;
let mockAxios;
let store;

describe('DiscussionTours data layer', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    mockAxios = new MockAdapter(getAuthenticatedHttpClient());
    store = initializeStore();
    actualActions = [];
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('DiscussionToursThunk', () => {
    const dispatch = (action) => {
      actualActions.push(action);
    };

    const getExpectedAction = (mockData) => ({
      request: {
        payload: undefined,
        type: 'userDiscussionsTours/discussionsTourRequest',
      },
      fetch: {
        type: 'userDiscussionsTours/fetchUserDiscussionsToursSuccess',
        payload: mockData,
      },
      update: {
        type: 'userDiscussionsTours/updateUserDiscussionsTourSuccess',
        payload: mockData,
      },
      error: {
        payload: undefined,
        type: 'userDiscussionsTours/discussionsToursRequestError',
      },
    });

    it('dispatches get request, success actions', async () => {
      const mockData = discussionTourFactory.buildList(2);
      mockAxios.onGet(url).reply(200, mockData);
      const expectedActions = [getExpectedAction().request, getExpectedAction(mockData).fetch];

      await fetchDiscussionTours()(dispatch);
      expect(actualActions).toEqual(expectedActions);
    });

    it('dispatches request, and error actions', async () => {
      mockAxios.onGet('/api/discussion-tours/').reply(500);
      const expectedActions = [getExpectedAction().request, getExpectedAction().error];

      await fetchDiscussionTours()(dispatch);
      expect(actualActions).toEqual(expectedActions);
    });

    it('dispatches put request, success actions', async () => {
      const mockData = discussionTourFactory.build();
      mockAxios.onPut(`${url}${1}`).reply(200, mockData);
      const expectedActions = [getExpectedAction().request, getExpectedAction(mockData).update];

      await updateTourShowStatus(1)(dispatch);
      expect(actualActions).toEqual(expectedActions);
    });

    it('dispatches update request, and error actions', async () => {
      mockAxios.onPut(`${url}${1}`).reply(500);
      const expectedActions = [getExpectedAction().request, getExpectedAction().error];

      await updateTourShowStatus(1)(dispatch);
      expect(actualActions).toEqual(expectedActions);
    });
  });

  describe('toursReducer', () => {
    it('handles the discussionsToursRequest action', async () => {
      store.dispatch(discussionsTourRequest());
      const { tours } = store.getState();

      expect(tours.tours).toEqual([]);
      expect(tours.error).toBeNull();
      expect(tours.loading).toEqual(RequestStatus.IN_PROGRESS);
    });

    it('handles the fetchUserDiscussionsToursSuccess action', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      await store.dispatch(fetchUserDiscussionsToursSuccess(mockData));
      const { tours } = store.getState();

      expect(tours).toEqual({
        tours: mockData,
        loading: RequestStatus.SUCCESSFUL,
        error: null,
      });
    });

    it('handles the updateUserDiscussionsTourSuccess action', async () => {
      const updatedTour = { id: 2, name: 'Updated Tour' };
      await store.dispatch(fetchUserDiscussionsToursSuccess([{ id: 1 }, { id: 2 }]));
      await store.dispatch(updateUserDiscussionsTourSuccess(updatedTour));
      const { tours } = store.getState();

      expect(tours.tours).toEqual([{ id: 1 }, updatedTour]);
    });

    it('handles the discussionsToursRequestError action', async () => {
      const errorMessage = 'Something went wrong';
      await store.dispatch(discussionsToursRequestError(errorMessage));
      const { tours } = store.getState();

      expect(tours).toEqual({
        tours: [],
        loading: RequestStatus.FAILED,
        error: errorMessage,
      });
    });

    it('handles the updateUserDiscussionsTourByName action', async () => {
      const tourName = 'response_sort';
      const updatedTour = {
        tourName: 'response_sort',
        enabled: false,
      };

      await mockAxios.onGet(getDiscussionTourUrl(), {}).reply(200, [discussionTourFactory.build({ tourName })]);
      await executeThunk(fetchDiscussionTours(), store.dispatch, store.getState);
      store.dispatch(updateUserDiscussionsTourByName(updatedTour));

      expect(store.getState().tours.tours).toEqual([{
        id: 4,
        tourName: 'response_sort',
        enabled: false,
        description: 'This is the description for Discussion Tour 4.',
      }]);
    });
  });

  describe('tourSelector', () => {
    it('returns the tours list from state', async () => {
      await mockAxios.onGet(getDiscussionTourUrl(), {}).reply(200, [
        discussionTourFactory.build({ tourName: 'other_filter' }),
      ]);
      await executeThunk(fetchDiscussionTours(), store.dispatch, store.getState);

      expect(selectTours(store.getState())).toEqual([{
        id: 5,
        tourName: 'other_filter',
        description: 'This is the description for Discussion Tour 5.',
        enabled: true,
      }]);
    });

    it('returns an empty list if the tours state is not defined', async () => {
      await executeThunk(fetchDiscussionTours(), store.dispatch, store.getState);

      expect(selectTours(store.getState())).toEqual([]);
    });
  });
});

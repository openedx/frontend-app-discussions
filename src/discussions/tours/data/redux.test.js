import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { RequestStatus } from '../../../data/constants';
import { initializeStore } from '../../../store';
import { getDiscussionTourUrl } from './api';
import { selectTours } from './selectors';
import {
  discussionsTourRequest,
  discussionsToursRequestError,
  fetchUserDiscussionsToursSuccess,
  toursReducer,
  updateUserDiscussionsTourSuccess,
} from './slices';
import { fetchDiscussionTours, updateTourShowStatus } from './thunks';
import discussionTourFactory from './tours.factory';

let mockAxios;
// eslint-disable-next-line no-unused-vars
let store;
const url = getDiscussionTourUrl();
describe('DiscussionToursThunk', () => {
  let actualActions;

  const dispatch = (action) => {
    actualActions.push(action);
  };

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

  it('dispatches get request, success actions', async () => {
    const mockData = discussionTourFactory.buildList(2);
    mockAxios.onGet(url)
      .reply(200, mockData);

    const expectedActions = [
      {
        payload: undefined,
        type: 'userDiscussionsTours/discussionsTourRequest',
      },
      {
        type: 'userDiscussionsTours/fetchUserDiscussionsToursSuccess',
        payload: mockData,
      },
    ];
    await fetchDiscussionTours()(dispatch);
    expect(actualActions)
      .toEqual(expectedActions);
  });

  it('dispatches request, and error actions', async () => {
    mockAxios.onGet('/api/discussion-tours/')
      .reply(500);
    const errorAction = [{
      payload: undefined,
      type: 'userDiscussionsTours/discussionsTourRequest',
    }, {
      payload: undefined,
      type: 'userDiscussionsTours/discussionsToursRequestError',
    }];

    await fetchDiscussionTours()(dispatch);
    expect(actualActions)
      .toEqual(errorAction);
  });

  it('dispatches put request, success actions', async () => {
    const mockData = discussionTourFactory.build();
    mockAxios.onPut(`${url}${1}`)
      .reply(200, mockData);

    const expectedActions = [
      {
        payload: undefined,
        type: 'userDiscussionsTours/discussionsTourRequest',
      },
      {
        type: 'userDiscussionsTours/updateUserDiscussionsTourSuccess',
        payload: mockData,
      },
    ];
    await updateTourShowStatus(1)(dispatch);
    expect(actualActions)
      .toEqual(expectedActions);
  });

  it('dispatches update request, and error actions', async () => {
    mockAxios.onPut(`${url}${1}`)
      .reply(500);
    const errorAction = [{
      payload: undefined,
      type: 'userDiscussionsTours/discussionsTourRequest',
    }, {
      payload: undefined,
      type: 'userDiscussionsTours/discussionsToursRequestError',
    }];

    await updateTourShowStatus(1)(dispatch);
    expect(actualActions)
      .toEqual(errorAction);
  });
});

describe('toursReducer', () => {
  it('handles the discussionsToursRequest action', () => {
    const initialState = {
      tours: [],
      loading: false,
      error: null,
    };
    const state = toursReducer(initialState, discussionsTourRequest());
    expect(state)
      .toEqual({
        tours: [],
        loading: RequestStatus.IN_PROGRESS,
        error: null,
      });
  });

  it('handles the fetchUserDiscussionsToursSuccess action', () => {
    const initialState = {
      tours: [],
      loading: true,
      error: null,
    };
    const mockData = [{ id: 1 }, { id: 2 }];
    const state = toursReducer(initialState, fetchUserDiscussionsToursSuccess(mockData));
    expect(state)
      .toEqual({
        tours: mockData,
        loading: RequestStatus.SUCCESSFUL,
        error: null,
      });
  });

  it('handles the updateUserDiscussionsTourSuccess action', () => {
    const initialState = {
      tours: [
        { id: 1 },
        { id: 2 },
      ],
    };
    const updatedTour = {
      id: 2,
      name: 'Updated Tour',
    };
    const state = toursReducer(initialState, updateUserDiscussionsTourSuccess(updatedTour));
    expect(state.tours)
      .toEqual([{ id: 1 }, updatedTour]);
  });

  it('handles the discussionsToursRequestError action', () => {
    const initialState = {
      tours: [],
      loading: true,
      error: null,
    };
    const mockError = new Error('Something went wrong');
    const state = toursReducer(initialState, discussionsToursRequestError(mockError));
    expect(state)
      .toEqual({
        tours: [],
        loading: RequestStatus.FAILED,
        error: mockError,
      });
  });
});

describe('tourSelector', () => {
  it('returns the tours list from state', () => {
    const state = {
      tours: {
        tours: [
          { id: 1, tourName: 'not_responded_filter' },
          { id: 2, tourName: 'other_filter' },
        ],
      },
    };
    const expectedResult = [
      { id: 1, tourName: 'not_responded_filter' },
      { id: 2, tourName: 'other_filter' },
    ];
    expect(selectTours(state)).toEqual(expectedResult);
  });

  it('returns an empty list if the tours state is not defined', () => {
    const state = {
      tours: {
        tours: [],
      },
    };
    expect(selectTours(state))
      .toEqual([]);
  });
});

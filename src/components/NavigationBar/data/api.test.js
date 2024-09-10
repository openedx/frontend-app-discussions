import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCourseMetadataApiUrl } from './api';
import fetchTab from './thunks';

import './__factories__';

const courseId = 'course-v1:edX+TestX+Test_Course';
let axiosMock = null;
let store;

describe('Navigation bar api tests', () => {
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
    store = initializeStore();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it('Successfully get navigation tabs', async () => {
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(200, (Factory.build('navigationBar', 1, { isEnrolled: true })));
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);

    expect(store.getState().courseTabs.tabs).toHaveLength(4);
    expect(store.getState().courseTabs.courseStatus).toEqual('loaded');
  });

  it('Failed to get navigation tabs', async () => {
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(404);
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);

    expect(store.getState().courseTabs.courseStatus).toEqual('failed');
  });

  it('Denied to get navigation tabs', async () => {
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(403, {});
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);

    expect(store.getState().courseTabs.courseStatus).toEqual('denied');
  });

  it('Denied to get navigation bar when user has no access on course', async () => {
    axiosMock.onGet(`${getCourseMetadataApiUrl(courseId)}`).reply(
      200,
      (Factory.build('navigationBar', 1, { hasCourseAccess: false, isEnrolled: true })),
    );
    await executeThunk(fetchTab(courseId, 'outline'), store.dispatch, store.getState);

    expect(store.getState().courseTabs.courseStatus).toEqual('denied');
  });
});

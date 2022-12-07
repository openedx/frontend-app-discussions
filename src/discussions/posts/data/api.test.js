import MockAdapter from 'axios-mock-adapter';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { getCoursesApiUrl, uploadFile } from './api';

const courseId = 'course-v1:edX+TestX+Test_Course';
const coursesApiUrl = getCoursesApiUrl();

let axiosMock = null;

describe('Threads/Posts api tests', () => {
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
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test('successfully completes upload requests', async () => {
    axiosMock.onPost(`${coursesApiUrl}${courseId}/upload`)
      .reply(200, { location: 'http://test/file.jpg' });
    const response = await uploadFile(new Blob(['sample data']), 'sample_file.jpg', courseId, 'root');
    expect(response.location).toEqual('http://test/file.jpg');
  });
});

import MockAdapter from 'axios-mock-adapter';

import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import { initializeStore } from '../../../store';
import executeThunk from '../../../test-utils';
import { getCoursesApiUrl, uploadFile } from './api';
import { sendAccountActivationEmail } from './thunks';

const courseId = 'course-v1:edX+TestX+Test_Course';
const coursesApiUrl = getCoursesApiUrl();

let axiosMock = null;
let store;

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
    store = initializeStore();
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

  test('successfully send email for account activation', async () => {
    axiosMock.onPost(`${getConfig().LMS_BASE_URL}/api/send_account_activation_email`)
      .reply(200, { success: true });

    await executeThunk(sendAccountActivationEmail(), store.dispatch, store.getState);

    expect(store.getState().threads.confirmEmailStatus).toEqual('successful');
  });

  test('fails to send email for account activation (server error)', async () => {
    axiosMock.onPost(`${getConfig().LMS_BASE_URL}/api/send_account_activation_email`)
      .reply(500);

    await executeThunk(sendAccountActivationEmail(), store.dispatch, store.getState);

    expect(store.getState().threads.confirmEmailStatus).toEqual('failed');
  });

  test('denied sending email for account activation (unauthorized)', async () => {
    axiosMock.onPost(`${getConfig().LMS_BASE_URL}/api/send_account_activation_email`)
      .reply(403);

    await executeThunk(sendAccountActivationEmail(), store.dispatch, store.getState);

    expect(store.getState().threads.confirmEmailStatus).toEqual('denied');
  });
});

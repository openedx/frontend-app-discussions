import React from 'react';

import { render, screen } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../../store';
import { executeThunk } from '../../../test-utils';
import { DiscussionContext } from '../../common/context';
import { courseConfigApiUrl } from '../../data/api';
import { fetchCourseConfig } from '../../data/thunks';
import PostLink from './PostLink';

const courseId = 'course-v1:edX+DemoX+Demo_Course';
let store;
let axiosMock;

function renderComponent(post, learnerTab = false) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <DiscussionContext.Provider value={{ courseId }}>
          <PostLink post={post} key={post.id} isSelected={() => true} learnerTab={learnerTab} />
        </DiscussionContext.Provider>
      </AppProvider>
    </IntlProvider>,
  );
}

const mockPost = {
  abuseFlagged: false,
  author: 'test-user',
  commentCount: 5,
  courseId: 'course-v1:edX+DemoX+Demo_Course',
  following: false,
  id: 'test-id',
  pinned: false,
  rawBody: '<p>a test post</p>',
  hasEndorsed: false,
  voted: false,
  voteCount: 10,
  previewBody: '<p>a test post</p>',
  read: false,
  title: 'test post',
  topicId: 'i4x-edx-eiorguegnru-course-foobarbaz',
  unreadCommentCount: 2,
  groupName: null,
  groupId: null,
  createdAt: '2022-02-25T09:17:17Z',
  closed: false,
};

describe('PostFooter', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
      has_moderation_privileges: true,
    });
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  });

  it('has reported text only when abuseFlagged is true', async () => {
    renderComponent(mockPost);
    expect(screen.queryByTestId('reported-post')).toBeFalsy();

    renderComponent({ ...mockPost, abuseFlagged: true });
    expect(screen.getByTestId('reported-post')).toBeTruthy();
  });
});

describe('Post username', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/`).reply(200, {
      learners_tab_enabled: true,
      has_moderation_privileges: true,
    });
    axiosMock.onGet(`${courseConfigApiUrl}${courseId}/settings`).reply(200, {});
    await executeThunk(fetchCourseConfig(courseId), store.dispatch, store.getState);
  });

  it.each([
    true,
    false,
  ])('is a clickable link %s', async (leanerTab) => {
    renderComponent(mockPost, leanerTab);

    if (leanerTab) {
      expect(screen.queryByTestId('learner-posts-link')).not.toBeInTheDocument();
    } else {
      expect(screen.queryByTestId('learner-posts-link')).toBeInTheDocument();
    }
  });

  it.each([
    true,
    false,
  ])('is only clickable if user is not anonymous', async (isAnonymous) => {
    renderComponent({ ...mockPost, author: isAnonymous ? null : 'test-user' });
    if (isAnonymous) {
      expect(screen.queryByTestId('learner-posts-link')).not.toBeInTheDocument();
    } else {
      expect(screen.queryByTestId('learner-posts-link')).toBeInTheDocument();
    }
  });
});

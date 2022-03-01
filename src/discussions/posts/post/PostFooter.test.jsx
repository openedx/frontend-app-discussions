import React from 'react';

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { initializeStore } from '../../../store';
import PostFooter from './PostFooter';

let store;

function renderComponent(post, preview = false) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <PostFooter post={post} preview={preview} />
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
  });

  it("shows 'x new' badge for new comments", () => {
    renderComponent(mockPost);
    expect(screen.getByText('2 new')).toBeTruthy();
  });

  it("doesn't have 'new' badge when there are 0 new comments", () => {
    renderComponent({ ...mockPost, unreadCommentCount: 0 });
    expect(screen.queryByText('2 new')).toBeFalsy();
    expect(screen.queryByText('0 new')).toBeFalsy();
  });

  it("doesn't has 'new' badge when the new-unread item is the post itself", () => {
    // commentCount === 1 means it's just the post without any further comments
    renderComponent({ ...mockPost, unreadCommentCount: 1, commentCount: 1 });
    expect(screen.queryByText('1 new')).toBeFalsy();
  });
});

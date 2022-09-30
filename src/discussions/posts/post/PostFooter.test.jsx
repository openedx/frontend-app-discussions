import React from 'react';

import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { RequestStatus } from '../../../data/constants';
import { initializeStore } from '../../../store';
import PostFooter from './PostFooter';

let store;

function renderComponent(post, preview = false, showNewCountLabel = false) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <PostFooter post={post} preview={preview} showNewCountLabel={showNewCountLabel} />
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
    store = initializeStore({
      config: {
        hasModerationPrivileges: true,
      },
    });
  });

  it("shows 'x new' badge for new comments in case of read post only", () => {
    renderComponent(mockPost, true, true);
    expect(screen.getByText('2 New')).toBeTruthy();
  });

  it("doesn't have 'new' badge when there are 0 new comments", () => {
    renderComponent({ ...mockPost, unreadCommentCount: 0 });
    expect(screen.queryByText('2 New')).toBeFalsy();
    expect(screen.queryByText('0 New')).toBeFalsy();
  });

  it("doesn't has 'new' badge when the new-unread item is the post itself", () => {
    // commentCount === 1 means it's just the post without any further comments
    renderComponent({ ...mockPost, unreadCommentCount: 1, commentCount: 1 });
    expect(screen.queryByText('1 New')).toBeFalsy();
  });

  it('has the cohort icon only when group information is present', () => {
    renderComponent(mockPost);
    expect(screen.queryByTestId('cohort-icon')).toBeFalsy();

    renderComponent({ ...mockPost, groupId: 5, groupName: 'Test Cohort' });
    expect(screen.getByTestId('cohort-icon')).toBeTruthy();
  });

  it.each([[true, /unfollow/i], [false, /follow/i]])('test follow button when following=%s', async (following, message) => {
    renderComponent({ ...mockPost, following });
    const followButton = screen.getByRole('button', { name: /follow/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.mouseEnter(followButton);
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent(message);
    await act(async () => {
      fireEvent.click(followButton);
    });
    // clicking on the button triggers thread update.
    expect(store.getState().threads.status === RequestStatus.IN_PROGRESS).toBeTruthy();
  });
});

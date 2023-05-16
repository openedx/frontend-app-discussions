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

function renderComponent(post, userHasModerationPrivileges = false) {
  return render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <PostFooter
          post={post}
          userHasModerationPrivileges={userHasModerationPrivileges}
          closed={post.closed}
          following={post.following}
          groupId={toString(post.groupId)}
          groupName={post.groupName}
          id={post.id}
          voted={post.voted}
          voteCount={post.voteCount}
        />
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

  it('has the cohort icon only when group information is present', () => {
    renderComponent(mockPost);
    expect(screen.queryByTestId('cohort-icon')).toBeFalsy();

    renderComponent({ ...mockPost, groupId: 5, groupName: 'Test Cohort' }, true);
    expect(screen.getByTestId('cohort-icon')).toBeTruthy();
  });

  it('test follow button when following=true', async () => {
    renderComponent({ ...mockPost, following: true });
    const followButton = screen.getByRole('button', { name: /follow/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.mouseEnter(followButton);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent(/unfollow/i);
    await act(async () => {
      fireEvent.click(followButton);
    });
    // clicking on the button triggers thread update.
    expect(store.getState().threads.status === RequestStatus.IN_PROGRESS).toBeTruthy();
  });

  it('test follow button when following = false', async () => {
    renderComponent({ ...mockPost, following: false });
    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
  });

  it('tests like button when voteCount is zero', async () => {
    renderComponent({ ...mockPost, voteCount: 0 });
    expect(screen.queryByRole('button', { name: /like/i })).not.toBeInTheDocument();
  });

  it('tests like button when voteCount is not zero', async () => {
    renderComponent({ ...mockPost, voted: true, voteCount: 4 });
    const likeButton = screen.getByRole('button', { name: /like/i });
    await act(async () => {
      fireEvent.mouseEnter(likeButton);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent(/unlike/i);
    await act(async () => {
      fireEvent.click(likeButton);
    });
    // clicking on the button triggers thread update.
    expect(store.getState().threads.status === RequestStatus.IN_PROGRESS).toBeTruthy();
  });
});

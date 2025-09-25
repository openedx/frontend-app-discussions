import React from 'react';

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getConfig } from '@edx/frontend-platform';

import { AvatarOutlineAndLabelColors, ThreadType } from '../../../data/constants';
import DiscussionContext from '../../common/context';
import { useAlertBannerVisible } from '../../data/hooks';
import PostHeader, { PostAvatar } from './PostHeader';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('@edx/frontend-platform', () => ({ getConfig: jest.fn() }));
jest.mock('../../data/hooks', () => ({ useAlertBannerVisible: jest.fn() }));

const defaultPostUsers = {
  'test-user': {
    profile: { image: { hasImage: true, imageUrlSmall: 'http://avatar.test/img.png' } },
  },
};

const ctxValue = { courseId: 'course-v1:edX+DemoX+Demo_Course', enableInContextSidebar: false };

function renderWithContext(ui) {
  return render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <DiscussionContext.Provider value={ctxValue}>
          {ui}
        </DiscussionContext.Provider>
      </MemoryRouter>
    </IntlProvider>,
  );
}

describe('PostAvatar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue({ imageUrlSmall: 'http://redux-avatar.png' });
    getConfig.mockReturnValue({ ENABLE_PROFILE_IMAGE: 'true' });
  });

  it('renders avatar with profile image when ENABLE_PROFILE_IMAGE=true', () => {
    renderWithContext(
      <PostAvatar
        author="test-user"
        postType={ThreadType.DISCUSSION}
        authorLabel="Staff"
        postUsers={defaultPostUsers}
      />,
    );

    const avatarImg = screen.getByAltText('test-user');
    expect(avatarImg).toHaveAttribute('src', 'http://avatar.test/img.png');
  });

  it('falls back to redux avatar if no profile image', () => {
    renderWithContext(
      <PostAvatar
        author="test-user"
        postType={ThreadType.DISCUSSION}
        authorLabel="Staff"
        postUsers={{ 'test-user': { profile: { image: { hasImage: false, imageUrlSmall: null } } } }}
      />,
    );

    const avatarImg = screen.getByAltText('test-user');
    expect(avatarImg).toHaveAttribute('src', 'http://redux-avatar.png');
  });

  it('applies Staff outline class if authorLabel provided', () => {
    renderWithContext(
      <PostAvatar
        author="test-user"
        postType={ThreadType.DISCUSSION}
        authorLabel="Staff"
        postUsers={defaultPostUsers}
      />,
    );

    const avatar = screen.getByAltText('test-user');
    expect(avatar.className).toMatch(`outline-${AvatarOutlineAndLabelColors.Staff}`);
  });

  it('applies anonymous outline class if no authorLabel', () => {
    const { container } = renderWithContext(
      <PostAvatar
        author="test-user"
        postType={ThreadType.DISCUSSION}
        authorLabel={null}
        postUsers={defaultPostUsers}
      />,
    );

    expect(container.querySelector('.outline-anonymous')).toBeInTheDocument();
  });
});

describe('PostHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue({ imageUrlSmall: 'http://redux-avatar.png' });
    getConfig.mockReturnValue({ ENABLE_PROFILE_IMAGE: 'true' });
    useAlertBannerVisible.mockReturnValue(false);
  });

  const renderHeader = (props = {}) => renderWithContext(
    <PostHeader
      author="test-user"
      authorLabel="Staff"
      abuseFlagged={false}
      closed={false}
      createdAt="2025-09-23T10:00:00Z"
      lastEdit={null}
      postUsers={defaultPostUsers}
      title="Sample Post Title"
      postType={ThreadType.DISCUSSION}
      hasEndorsed={false}
      preview={false}
      {...props}
    />,
  );

  it('renders post title and author', () => {
    renderHeader();
    expect(screen.getByText('Sample Post Title')).toBeInTheDocument();
    expect(screen.getByText('test-user')).toBeInTheDocument();
  });

  it('adds answered badge for endorsed QUESTION preview', () => {
    renderHeader({ postType: ThreadType.QUESTION, hasEndorsed: true, preview: true });
    expect(screen.getByText(/answered/i)).toBeInTheDocument();
  });

  it('adds mt-10px class if alert banner is visible', () => {
    useAlertBannerVisible.mockReturnValue(true);
    const { container } = renderHeader({ preview: false });
    expect(container.firstChild).toHaveClass('mt-10px');
  });

  it('falls back to anonymous if no author provided', () => {
    renderHeader({ author: '' });
    expect(screen.getByText(/anonymous/i)).toBeInTheDocument();
  });
});

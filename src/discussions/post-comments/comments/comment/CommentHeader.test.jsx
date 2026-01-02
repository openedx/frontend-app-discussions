import React from 'react';

import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { getConfig } from '@edx/frontend-platform';

import DiscussionContext from '../../../common/context';
import { useAlertBannerVisible } from '../../../data/hooks';
import CommentHeader from './CommentHeader';

jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('@edx/frontend-platform', () => ({ getConfig: jest.fn() }));
jest.mock('../../../data/hooks', () => ({ useAlertBannerVisible: jest.fn() }));

const defaultProps = {
  author: 'test-user',
  authorLabel: 'staff',
  abuseFlagged: false,
  closed: false,
  createdAt: '2025-09-23T10:00:00Z',
  lastEdit: null,
  commentUsers: {
    'test-user': {
      profile: { image: { hasImage: true, imageUrlSmall: 'http://avatar.test/img.png' } },
    },
  },
};

const renderComponent = (
  props = {},
  ctx = { courseId: 'course-v1:edX+DemoX+Demo_Course', enableInContextSidebar: false },
) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <DiscussionContext.Provider value={ctx}>
        <CommentHeader {...defaultProps} {...props} />
      </DiscussionContext.Provider>
    </MemoryRouter>
  </IntlProvider>,
);

describe('CommentHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockReturnValue('http://fallback-avatar.png');
    useAlertBannerVisible.mockReturnValue(false);
    getConfig.mockReturnValue({ ENABLE_PROFILE_IMAGE: 'true' });
  });

  it('renders author and avatar with profile image when ENABLE_PROFILE_IMAGE=true', () => {
    renderComponent();
    const avatarImg = screen.getByAltText('test-user');
    expect(avatarImg).toHaveAttribute('src', 'http://avatar.test/img.png');
    expect(screen.getByText('test-user')).toBeInTheDocument();
  });

  it('uses redux avatar if profile image is disabled by config', () => {
    getConfig.mockReturnValue({ ENABLE_PROFILE_IMAGE: 'false' });
    const { container } = renderComponent();
    const avatar = container.querySelector('.outline-staff, .outline-anonymous');
    expect(avatar).toBeInTheDocument();
  });

  it('applies anonymous class if no color class is found', () => {
    const { container } = renderComponent({ authorLabel: null });
    expect(container.querySelector('.outline-anonymous')).toBeInTheDocument();
  });

  it('adds margin-top if alert banner is visible', () => {
    useAlertBannerVisible.mockReturnValue(true);
    const { container } = renderComponent();
    expect(container.firstChild).toHaveClass('mt-2');
  });
});

import React, { useContext } from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { Alert } from '@edx/paragon';
import {
  Pin,
  Flag,
  VerifiedBadge,
  MoreVert,
} from '@edx/paragon/icons';

import messages from './messages';
import { postShape } from './Post';
import { commentShape } from '../../comments/comment/Comment';

function banner(post) {
  if (post.abuseFlagged) {
    return { variant: 'danger', icon: Flag, message: messages.contentReported };
  }
  if (post.hasClosed) {
    return { variant: 'info', icon: MoreVert, message: messages.closed };
  }
  if (post.endorsed) {
    return { variant: 'success', icon: VerifiedBadge, message: messages.endorsed };
  }
  if (post.pinned) {
    return { variant: 'info', icon: Pin, message: messages.pinned };
  }
  return null;
}

function PostBanner({ post, intl }) {
  const { authenticatedUser } = useContext(AppContext);
  const bannerProps = banner(post);
  // show pinned, reported, endorsed and closed posts for moderators
  if (authenticatedUser.administrator && bannerProps) {
    return (
      <div>
        <Alert
          className="d-flex flex-row align-items-start mb-0 p-3"
          variant={bannerProps.variant}
          icon={bannerProps.icon}
        >
          <>{intl.formatMessage(bannerProps.message)}</>
        </Alert>
      </div>
    );
  }
  // show pinned post for learners
  if (post.pinned) {
    return (
      <div>
        <Alert
          className="d-flex flex-row align-items-start mb-0 p-3"
          variant="info"
          icon={Pin}
        >
          <>{intl.formatMessage(messages.pinned)}</>
        </Alert>
      </div>
    );
  }

  return null;
}

PostBanner.propTypes = {
  // eslint-disable-next-line react/require-default-props
  post: postShape || commentShape,
  intl: intlShape.isRequired,
};

export default injectIntl(PostBanner);

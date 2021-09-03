import React from 'react';

import { generatePath, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { Flag, Unread } from '@edx/paragon/icons';

import { Routes } from '../../../data/constants';
import messages from './messages';
import Post, { postShape } from './Post';

function PostLink({
  post,
  intl,
}) {
  const { params: { page } } = useRouteMatch(Routes.COMMENTS.PAGE);
  const linkUrl = generatePath(Routes.COMMENTS.PAGES[page], {
    courseId: post.courseId,
    topicId: post.topicId,
    postId: post.id,
  });
  return (
    <Link
      className="discussion-post list-group-item list-group-item-action p-0 text-decoration-none text-gray-900"
      to={linkUrl}
    >
      {post.abuseFlagged && (
        <div className="align-items-center bg-danger-100 d-flex flex-fill p-1">
          <Icon className="text-danger-700" src={Flag} />
          <span className="text-gray-700 x-small">{intl.formatMessage(messages.contentReported)}</span>
        </div>
      )}
      <div className={`d-flex flex-row p-2 ${post.read ? 'bg-light-200' : ''}`}>
        {!post.read && <Icon className="text-brand-500" src={Unread} />}
        <Post post={post} />
      </div>
    </Link>
  );
}

PostLink.propTypes = {
  post: postShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PostLink);

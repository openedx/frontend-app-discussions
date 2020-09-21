import React from 'react';

import { faCircle, faFlag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { Routes } from '../../../data/constants';
import messages from './messages';
import Post, { postShape } from './Post';

function PostLink({
  post,
  intl,
}) {
  return (
    <Link
      className="discussion-post list-group-item list-group-item-action p-0 text-decoration-none text-gray-900"
      to={
        Routes.COMMENTS.PATH.replace(':courseId', post.courseId)
          .replace(':topicId', post.topicId)
          .replace(':postId', post.id)
      }
    >
      {post.abuseFlagged && (
        <div className="bg-gray-100 flex-fill">
          <FontAwesomeIcon icon={faFlag} className="mx-1" />
          {intl.formatMessage(messages.contentReported)}
        </div>
      )}
      <div className="d-flex flex-row mb-2">
        <FontAwesomeIcon icon={faCircle} className={`my-1 text-accent-a ${post.read && 'invisible'}`} size="xs" />
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

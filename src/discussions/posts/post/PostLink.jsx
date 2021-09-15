import React, { useContext } from 'react';

import classNames from 'classnames';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon } from '@edx/paragon';
import { Flag, Unread } from '@edx/paragon/icons';

import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import messages from './messages';
import Post, { postShape } from './Post';
import PostBanner from './PostBanner';

function PostLink({
  post,
  intl,
}) {
  const {
    page,
    postId,
  } = useContext(DiscussionContext);
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
      <div className={classNames('d-flex flex-row flex-fill mw-100', { 'bg-light-200': post.read })}>
        <Icon className={classNames('p-0 mr-n3 text-brand-500', { invisible: post.read })} src={Unread} />
        <Post post={post} preview />
        <div className={classNames('d-flex pl-1.5 bg-info-500', { invisible: post.id !== postId })} />
      </div>
    </Link>
  );
}

PostLink.propTypes = {
  post: postShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PostLink);

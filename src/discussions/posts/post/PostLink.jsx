import React, { useContext } from 'react';

import classNames from 'classnames';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon,
} from '@edx/paragon';
import { Unread } from '@edx/paragon/icons';

import BANNER_TYPE from '../../../components/Banner';
import { Routes } from '../../../data/constants';
import { DiscussionContext } from '../../common/context';
import messages from './messages';
import Post, { postShape } from './Post';

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
      { post.closed && BANNER_TYPE.closed(intl.formatMessage(messages.closed))}
      { post.abuseFlagged && BANNER_TYPE.reported(intl.formatMessage(messages.contentReported)) }
      { post.pinned && BANNER_TYPE.pinned(intl.formatMessage(messages.pinned)) }
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

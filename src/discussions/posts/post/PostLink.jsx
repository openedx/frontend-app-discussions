import React, { useContext } from 'react';

import classNames from 'classnames';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Badge, Icon } from '@edx/paragon';
import { Flag, Pin, Unread } from '@edx/paragon/icons';

import { Routes, ThreadType } from '../../../data/constants';
import AuthorLabel from '../../common/AuthorLabel';
import { DiscussionContext } from '../../common/context';
import messages from './messages';
import PostFooter from './PostFooter';
import { PostAvatar } from './PostHeader';
import { postShape } from './proptypes';

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
  const showAnsweredBadge = post.hasEndorsed && post.type === ThreadType.QUESTION;
  return (
    <Link
      className="discussion-post list-group-item list-group-item-action p-0 text-decoration-none text-gray-900 mw-100"
      to={linkUrl}
    >
      {post.pinned && (
        <div className="d-flex flex-fill justify-content-end mr-4 text-light-500">
          <Icon src={Pin} className="position-absolute" />
        </div>
      )}
      {post.abuseFlagged && (
        <div className="align-items-center bg-danger-100 d-flex flex-fill p-1">
          <Icon className="text-danger-700" src={Flag} />
          <span className="text-gray-700 x-small">{intl.formatMessage(messages.contentReported)}</span>
        </div>
      )}
      <div
        className={classNames('d-flex flex-row flex-fill mw-100 p-3.5 border-primary-500', { 'bg-light-200': post.read })}
        style={post.id === postId ? { borderRightWidth: '4px', borderRightStyle: 'solid' } : null}
      >
        <Icon className={classNames('p-0 mr-n3 text-brand-500', { invisible: post.read })} src={Unread} />
        <PostAvatar post={post} />
        <div className="d-flex flex-column" style={{ width: 'calc(100% - 4rem)' }}>
          <div className="align-items-center d-flex flex-row flex-fill">
            <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
              <div className="h4 d-flex align-items-center pb-0 mb-0 flex-fill">
                <div className="flex-fill text-truncate">
                  {post.title}
                </div>
                {showAnsweredBadge
                  && (
                  <div className="ml-auto"><Badge variant="success">{intl.formatMessage(messages.answered)}</Badge>
                  </div>
                  )}
              </div>
              <AuthorLabel author={post.author} authorLabel={post.authorLabel} />
            </div>
          </div>
          <div>{post.previewBody}</div>
          <PostFooter post={post} preview intl={intl} />
        </div>
      </div>
    </Link>
  );
}

PostLink.propTypes = {
  post: postShape.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PostLink);

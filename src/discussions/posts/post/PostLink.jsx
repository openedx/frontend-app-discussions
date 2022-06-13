import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Badge, Icon } from '@edx/paragon';
import { Bookmark } from '@edx/paragon/icons';

import { AvatarBorderAndLabelColors, Routes, ThreadType } from '../../../data/constants';
import AuthorLabel from '../../common/AuthorLabel';
import { DiscussionContext } from '../../common/context';
import { discussionsPath, isPostPreviewAvailable } from '../../utils';
import messages from './messages';
import PostFooter from './PostFooter';
import { PostAvatar } from './PostHeader';
import { postShape } from './proptypes';

function PostLink({
  post,
  isSelected,
  intl,
}) {
  const {
    page,
    postId,
    inContext,
    category,
  } = useContext(DiscussionContext);
  const linkUrl = discussionsPath(Routes.COMMENTS.PAGES[page], {
    0: inContext ? 'in-context' : undefined,
    courseId: post.courseId,
    topicId: post.topicId,
    postId: post.id,
    category,
  });
  const showAnsweredBadge = post.hasEndorsed && post.type === ThreadType.QUESTION;
  const authorLabelColor = AvatarBorderAndLabelColors[post.authorLabel];
  return (
    <Link
      className="discussion-post list-group-item list-group-item-action p-0 text-decoration-none text-gray-900"
      to={linkUrl}
      aria-current={isSelected(post.id) ? 'page' : undefined}
      onClick={() => isSelected(post.id)}
      style={{ lineHeight: '21px' }}
      role="listitem"
      aria-level="1"
    >
      {post.pinned && (
        <div className="d-flex flex-fill justify-content-end mr-4 text-primary-500 p-0">
          <span className="sr-only">{' '}pinned</span>
          <Icon src={Bookmark} className="position-absolute mt-n1" />
        </div>
      )}
      <div
        className={
          classNames('d-flex flex-row py-2.5 px-4 border-primary-500',
            { 'bg-light-300': post.read })
        }
        style={post.id === postId ? {
          borderRightWidth: '4px',
          borderRightStyle: 'solid',
        } : null}
      >
        <PostAvatar post={post} authorLabel={post.authorLabel} fromPostLink />
        <div className="d-flex flex-column flex-fill" style={{ minWidth: 0 }}>
          <div className="d-flex flex-column justify-content-start mw-100 flex-fill">
            <div className="d-flex align-items-center pb-0 mb-0 flex-fill font-weight-500">
              <div
                className={
                  classNames('text-truncate font-weight-500 font-size-14 text-primary-500 font-style-normal font-family-inter',
                    { 'font-weight-bolder': !post.read })
}
              >
                {post.title}
              </div>

              {showAnsweredBadge && (
                <Badge variant="success" className="font-weight-500 ml-auto badge-padding">
                  {intl.formatMessage(messages.answered)}
                  <span className="sr-only">{' '}answered</span>
                </Badge>
              )}

              {(post.abuseFlagged || post.abuseFlaggedCount) && (
                <Badge
                  variant="danger"
                  data-testid="reported-post"
                  className={`font-weight-500 badge-padding ${showAnsweredBadge ? 'ml-2' : 'ml-auto'}`}
                >
                  {intl.formatMessage(messages.contentReported)}
                  <span className="sr-only">{' '}reported</span>
                </Badge>
              )}
            </div>
          </div>
          <AuthorLabel
            author={post.author || intl.formatMessage(messages.anonymous)}
            authorLabel={post.authorLabel}
            labelColor={authorLabelColor && `text-${authorLabelColor}`}
          />
          <div
            className="text-truncate text-primary-500 font-weight-normal font-size-14 font-style-normal font-family-inter"
            style={{ maxHeight: '1.5rem' }}
          >
            {isPostPreviewAvailable(post.previewBody)
              ? post.previewBody
              : intl.formatMessage(messages.postWithoutPreview)}
          </div>
          <PostFooter post={post} preview intl={intl} />
        </div>
      </div>
    </Link>
  );
}

PostLink.propTypes = {
  post: postShape.isRequired,
  isSelected: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(PostLink);

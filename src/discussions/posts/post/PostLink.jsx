import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { Badge, Icon } from '@openedx/paragon';
import { CheckCircle, PushPin } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';

import { AvatarOutlineAndLabelColors, Routes, ThreadType } from '../../../data/constants';
import AuthorLabel from '../../common/AuthorLabel';
import DiscussionContext from '../../common/context';
import { discussionsPath, isPostPreviewAvailable } from '../../utils';
import { selectThread } from '../data/selectors';
import messages from './messages';
import { PostAvatar } from './PostHeader';
import PostSummaryFooter from './PostSummaryFooter';

const PostLink = ({
  idx,
  postId,
  showDivider,
}) => {
  const intl = useIntl();
  const { search } = useLocation();
  const {
    courseId,
    postId: selectedPostId,
    page,
    enableInContextSidebar,
    category,
    learnerUsername,
  } = useContext(DiscussionContext);
  const {
    topicId, hasEndorsed, type, author, authorLabel, abuseFlagged, abuseFlaggedCount, read, commentCount,
    unreadCommentCount, id, pinned, previewBody, title, voted, voteCount, following, groupId, groupName, createdAt,
  } = useSelector(selectThread(postId));
  const { pathname } = discussionsPath(Routes.COMMENTS.PAGES[page], {
    0: enableInContextSidebar ? 'in-context' : undefined,
    courseId,
    topicId,
    postId,
    category,
    learnerUsername,
  })();
  const showAnsweredBadge = hasEndorsed && type === ThreadType.QUESTION;
  const authorLabelColor = AvatarOutlineAndLabelColors[authorLabel];
  const canSeeReportedBadge = abuseFlagged || abuseFlaggedCount;
  const isPostRead = read || (!read && commentCount !== unreadCommentCount);

  const checkIsSelected = useMemo(
    () => (
      window.location.pathname.includes(postId)),
    [window.location.pathname],
  );

  return (
    <Link
      className={
          classNames('discussion-post p-0 text-decoration-none text-gray-900', {
            'border-bottom border-light-400': showDivider,
          })
        }
      to={`${pathname}${enableInContextSidebar ? search : ''}`}
      aria-current={checkIsSelected ? 'page' : undefined}
      role="option"
      tabIndex={(checkIsSelected || idx === 0) ? 0 : -1}
    >
      <div
        className={
            classNames(
              'd-flex flex-row pt-2 pb-2 px-4 border-primary-500 position-relative',
              { 'bg-light-300': isPostRead },
              { 'post-summary-card-selected': id === selectedPostId },
            )
          }
      >
        <PostAvatar
          postType={type}
          author={author}
          authorLabel={authorLabel}
          fromPostLink
          read={isPostRead}
        />
        <div className="d-flex flex-column flex-fill" style={{ minWidth: 0 }}>
          <div className="d-flex flex-column justify-content-start mw-100 flex-fill" style={{ marginBottom: '-3px' }}>
            <div className="d-flex align-items-center pb-0 mb-0 flex-fill">
              <div className="text-truncate mr-1">
                <span className={classNames(
                  'font-weight-500 text-primary-500 font-style align-bottom mr-1',
                  { 'font-weight-bolder': !read },
                )}
                >
                  {title}
                </span>
                <span className="text-gray-700 font-weight-normal  font-style align-bottom">
                  {isPostPreviewAvailable(previewBody) ? previewBody : intl.formatMessage(messages.postWithoutPreview)}
                </span>
              </div>
              {showAnsweredBadge && (
                <Icon
                  data-testid="check-icon"
                  src={CheckCircle}
                  className="text-success font-weight-500 ml-auto badge-padding"
                >
                  <span className="sr-only">{' '}answered</span>
                </Icon>
              )}
              {canSeeReportedBadge && (
                <Badge
                  variant="danger"
                  data-testid="reported-post"
                  className={`font-weight-500 badge-padding ${showAnsweredBadge ? 'ml-2' : 'ml-auto'}`}
                >
                  {intl.formatMessage(messages.contentReported)}
                  <span className="sr-only">{' '}reported</span>
                </Badge>
              )}
              {pinned && (
                <Icon
                  src={PushPin}
                  className={classNames('post-summary-icons-dimensions text-gray-700', {
                    'ml-2': canSeeReportedBadge || showAnsweredBadge,
                    'ml-auto': !canSeeReportedBadge && !showAnsweredBadge,
                  })}
                />
              )}
            </div>
          </div>
          <AuthorLabel
            author={author || intl.formatMessage(messages.anonymous)}
            authorLabel={authorLabel}
            labelColor={authorLabelColor && `text-${authorLabelColor}`}
          />
          <PostSummaryFooter
            postId={id}
            voted={voted}
            voteCount={voteCount}
            following={following}
            commentCount={commentCount}
            unreadCommentCount={unreadCommentCount}
            groupId={groupId}
            groupName={groupName}
            createdAt={createdAt}
            preview
            showNewCountLabel={isPostRead}
          />
        </div>
      </div>
      {!showDivider && pinned && <div className="pt-1 bg-light-500 border-top border-light-700" />}
    </Link>
  );
};

PostLink.propTypes = {
  idx: PropTypes.number,
  postId: PropTypes.string.isRequired,
  showDivider: PropTypes.bool,
};

PostLink.defaultProps = {
  idx: -1,
  showDivider: true,
};

export default React.memo(PostLink);

/* eslint-disable react/no-unknown-property */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge, Icon, Truncate } from '@edx/paragon';
import { CheckCircle } from '@edx/paragon/icons';

import { PushPin } from '../../../components/icons';
import { AvatarOutlineAndLabelColors, Routes, ThreadType } from '../../../data/constants';
import AuthorLabel from '../../common/AuthorLabel';
import { DiscussionContext } from '../../common/context';
import { discussionsPath, isPostPreviewAvailable } from '../../utils';
import { selectThread } from '../data/selectors';
import messages from './messages';
import { PostAvatar } from './PostHeader';
import PostSummaryFooter from './PostSummaryFooter';

const PostLink = ({
  idx,
  isSelected,
  postId,
  showDivider,
}) => {
  console.log('postlink', useSelector(selectThread(postId)));

  const intl = useIntl();
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
  const linkUrl = discussionsPath(Routes.COMMENTS.PAGES[page], {
    0: enableInContextSidebar ? 'in-context' : undefined,
    courseId,
    topicId,
    postId,
    category,
    learnerUsername,
  });
  const showAnsweredBadge = hasEndorsed && type === ThreadType.QUESTION;
  const authorLabelColor = AvatarOutlineAndLabelColors[authorLabel];
  const canSeeReportedBadge = abuseFlagged || abuseFlaggedCount;
  const isPostRead = read || (!read && commentCount !== unreadCommentCount);

  return (
    <>
      <Link
        className={
          classNames('discussion-post p-0 text-decoration-none text-gray-900', {
            'border-bottom border-light-400': showDivider,
          })
        }
        to={linkUrl}
        onClick={() => isSelected(id)}
        aria-current={isSelected(id) ? 'page' : undefined}
        role="option"
        tabIndex={(isSelected(id) || idx === 0) ? 0 : -1}
      >
        <div
          className={
            classNames('d-flex flex-row pt-2 pb-2 px-4 border-primary-500 position-relative',
              { 'bg-light-300': isPostRead },
              { 'post-summary-card-selected': id === selectedPostId })
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
              <div className="d-flex align-items-center pb-0 mb-0 flex-fill font-weight-500">
                <Truncate lines={1} className="mr-1.5" whiteSpace>
                  <span
                    class={
                      classNames('font-weight-500 font-size-14 text-primary-500 font-style align-bottom',
                        { 'font-weight-bolder': !read })
                    }
                  >
                    {title}
                  </span>
                  <span class="align-bottom"> </span>
                  <span
                    class="text-gray-700 font-weight-normal font-size-14 font-style align-bottom"
                  >
                    {isPostPreviewAvailable(previewBody)
                      ? previewBody
                      : intl.formatMessage(messages.postWithoutPreview)}
                  </span>
                </Truncate>
                {showAnsweredBadge && (
                  <Icon src={CheckCircle} className="text-success font-weight-500 ml-auto badge-padding" data-testid="check-icon">
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
                    className={`post-summary-icons-dimensions text-gray-700
                    ${canSeeReportedBadge || showAnsweredBadge ? 'ml-2' : 'ml-auto'}`}
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
    </>
  );
};

PostLink.propTypes = {
  idx: PropTypes.number,
  isSelected: PropTypes.func.isRequired,
  postId: PropTypes.string.isRequired,
  showDivider: PropTypes.bool,
};

PostLink.defaultProps = {
  idx: -1,
  showDivider: true,
};

export default React.memo(PostLink);

import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Badge, Icon, IconButtonWithTooltip, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Locked,
} from '@edx/paragon/icons';

import {
  People,
  QuestionAnswer,
  QuestionAnswerOutline,
  StarFilled,
  StarOutline,
} from '../../../components/icons';
import timeLocale from '../../common/time-locale';
import { selectUserHasModerationPrivileges } from '../../data/selectors';
import { updateExistingThread } from '../data/thunks';
import LikeButton from './LikeButton';
import messages from './messages';
import { postShape } from './proptypes';

function PostFooter({
  post,
  intl,
  preview,
  showNewCountLabel,
}) {
  const dispatch = useDispatch();
  const userHasModerationPrivileges = useSelector(selectUserHasModerationPrivileges);
  timeago.register('time-locale', timeLocale);

  return (
    <div className="d-flex align-items-center">
      <LikeButton
        count={post.voteCount}
        onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
        voted={post.voted}
        preview={preview}
      />
      <IconButtonWithTooltip
        id={`follow-${post.id}-tooltip`}
        tooltipPlacement="top"
        tooltipContent={intl.formatMessage(post.following ? messages.unFollow : messages.follow)}
        src={post.following ? StarFilled : StarOutline}
        iconAs={Icon}
        alt="Follow"
        onClick={(e) => {
          e.preventDefault();
          dispatch(updateExistingThread(post.id, { following: !post.following }));
          return true;
        }}
        size={preview ? 'inline' : 'sm'}
        className={preview && 'p-3'}
        iconClassNames={preview && 'icon-size'}
      />
      {preview && post.commentCount > 1 && (
        <div className="d-flex align-items-center ml-4">
          <IconButtonWithTooltip
            tooltipPlacement="top"
            tooltipContent={intl.formatMessage(messages.viewActivity)}
            src={post.unreadCommentCount ? QuestionAnswer : QuestionAnswerOutline}
            iconAs={Icon}
            alt="Comment Count"
            size="inline"
            className="p-3 mr-0.5"
            iconClassNames="icon-size"
          />
          {post.commentCount}
        </div>
      )}
      {showNewCountLabel && preview && post?.unreadCommentCount > 0 && post.commentCount > 1 && (
        <Badge variant="light" className="ml-2">
          {intl.formatMessage(messages.newLabel, { count: post.unreadCommentCount })}
        </Badge>
      )}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {post.groupId && userHasModerationPrivileges && (
          <>
            <OverlayTrigger
              overlay={(
                <Tooltip id={`visibility-${post.id}-tooltip`}>{post.groupName}</Tooltip>
              )}
            >
              <span data-testid="cohort-icon">
                <People />
              </span>
            </OverlayTrigger>
            <span
              className="text-gray-700 mx-1.5 font-weight-500"
              style={{ fontSize: '16px' }}
            >
              ·
            </span>
          </>
        )}
        <span title={post.createdAt} className="text-gray-700">
          {timeago.format(post.createdAt, 'time-locale')}
        </span>
        {!preview && post.closed
          && (
            <OverlayTrigger
              overlay={(
                <Tooltip id={`closed-${post.id}-tooltip`}>
                  {intl.formatMessage(messages.postClosed)}
                </Tooltip>
              )}
            >
              <Icon
                src={Locked}
                style={{
                  width: '1rem',
                  height: '1rem',
                }}
                className="ml-3"
              />
            </OverlayTrigger>
          )}
      </div>
    </div>
  );
}

PostFooter.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool,
  showNewCountLabel: PropTypes.bool,
};

PostFooter.defaultProps = {
  preview: false,
  showNewCountLabel: false,
};

export default injectIntl(PostFooter);

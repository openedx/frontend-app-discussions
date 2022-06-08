import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
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
import { updateExistingThread } from '../data/thunks';
import LikeButton from './LikeButton';
import messages from './messages';
import { postShape } from './proptypes';

function PostFooter({
  post,
  intl,
  preview,
}) {
  const dispatch = useDispatch();
  timeago.register('time-locale', timeLocale);

  return (
    <div className="d-flex align-items-center">
      <LikeButton
        count={post.voteCount}
        onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
        voted={post.voted}
      />
      <IconButtonWithTooltip
        id={`follow-${post.id}-tooltip`}
        tooltipPlacement="top"
        tooltipContent={intl.formatMessage(post.following ? messages.unFollow : messages.follow)}
        src={post.following ? StarFilled : StarOutline}
        iconAs={Icon}
        alt="Follow"
        onClick={() => {
          dispatch(updateExistingThread(post.id, { following: !post.following }));
          return true;
        }}
        size="inline"
        className="p-3"
        iconClassNames="icon-size"
      />
      {preview && post.commentCount > 1 && (
        <div className="d-flex align-items-center ml-4">
          <Icon
            src={post.unreadCommentCount ? QuestionAnswer : QuestionAnswerOutline}
            className="mr-0.5 icon-size"
          />
          {post.commentCount}
        </div>
      )}
      {preview && post?.unreadCommentCount > 0 && post.commentCount > 1 && (
        <Badge variant="light" className="ml-2">
          {intl.formatMessage(messages.newLabel, { count: post.unreadCommentCount })}
        </Badge>
      )}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {post.groupId && (
          <>
            <OverlayTrigger
              overlay={(
                <Tooltip id={`visibility-${post.id}-tooltip`}>{post.groupName}</Tooltip>
              )}
            >
              <People />
            </OverlayTrigger>
            <span
              className="text-light-700 mx-1.5 font-weight-500"
              style={{ fontSize: '16px' }}
            >
              ·
            </span>
          </>
        )}
        <span title={post.createdAt} className="text-gray-500">
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
                  width: '1em',
                  height: '1em',
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
};

PostFooter.defaultProps = {
  preview: false,
};

export default injectIntl(PostFooter);

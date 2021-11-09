import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import * as timeago from 'timeago.js';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import {
  Locked, Person, QuestionAnswer, StarFilled, StarOutline,
} from '@edx/paragon/icons';

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
  return (
    <div className="d-flex align-items-center">
      <LikeButton
        count={post.voteCount}
        onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
        voted={post.voted}
      />
      <OverlayTrigger
        overlay={(
          <Tooltip>
            {intl.formatMessage(post.following ? messages.unfollow : messages.follow)}
          </Tooltip>
        )}
      >
        {preview
          ? <Icon src={post.following ? StarFilled : StarOutline} className="my-0 mr-4.5" />
          : (
            <IconButton
              onClick={() => {
                dispatch(updateExistingThread(post.id, { following: !post.following }));
                return true;
              }}
              alt="Follow"
              iconAs={Icon}
              size="inline"
              className="mx-2.5 my-0"
              src={post.following ? StarFilled : StarOutline}
            />
          )}
      </OverlayTrigger>
      {preview
        && (
          <>
            <Icon src={QuestionAnswer} className="mx-2 my-0" />
            <span style={{ minWidth: '2rem' }}>
              {post.commentCount}
            </span>
          </>
        )}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {!preview
          && (
            <span className="text-gray-500 mr-4 d-flex align-items-center">
              <Icon
                src={Person}
                className="mr-1"
                style={{
                  width: '1em',
                  height: '1em',
                }}
              />
              {post.groupName || intl.formatMessage(messages.visibleToAll)}
            </span>
          )}
        <span title={post.createdAt} className="text-gray-500">
          {timeago.format(post.createdAt, intl.locale)}
        </span>
        {!preview && post.closed
          && (
            <OverlayTrigger
              overlay={(
                <Tooltip>
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

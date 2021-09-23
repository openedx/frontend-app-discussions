import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import { StarFilled, StarOutline } from '@edx/paragon/icons';

import { ContentActions } from '../../../data/constants';
import { removeThread, updateExistingThread } from '../data/thunks';
import LikeButton from './LikeButton';
import messages from './messages';
import PostHeader from './PostHeader';
import { postShape } from './proptypes';

function Post({
  post,
  preview,
  intl,
}) {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const actionHandlers = {
    [ContentActions.EDIT_CONTENT]: () => history.push(`${location.pathname}/edit`),
    // TODO: Add flow to confirm before deleting
    [ContentActions.DELETE]: () => dispatch(removeThread(post.id)),
    [ContentActions.CLOSE]: () => dispatch(updateExistingThread(post.id, { closed: !post.closed })),
    [ContentActions.PIN]: () => dispatch(updateExistingThread(post.id, { pinned: !post.pinned })),
    [ContentActions.REPORT]: () => dispatch(updateExistingThread(post.id, { flagged: !post.abuseFlagged })),
  };

  return (
    <div className="d-flex flex-column p-2.5 w-100">
      <PostHeader post={post} preview={preview} actionHandlers={actionHandlers} />
      <div
        className="d-block mt-2 mb-0 p-0 overflow-hidden text-break"
        dangerouslySetInnerHTML={{ __html: post.renderedBody }}
        style={{
          maxHeight: preview ? '3rem' : null,
          maxWidth: preview ? '80%' : null,
        }}
      />
      <div className="d-flex align-items-center">
        <LikeButton
          count={post.voteCount}
          onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
          voted={post.voted}
        />
        <OverlayTrigger
          className="mx-2.5"
          overlay={(
            <Tooltip>
              {intl.formatMessage(post.following ? messages.unfollow : messages.follow)}
            </Tooltip>
          )}
        >
          <IconButton
            onClick={() => {
              dispatch(updateExistingThread(post.id, { following: !post.following }));
              return true;
            }}
            alt="Follow"
            iconAs={Icon}
            size="inline"
            src={post.following ? StarFilled : StarOutline}
          />
        </OverlayTrigger>
        {post.following && <span>{intl.formatMessage(messages.following)}</span>}
      </div>
    </div>
  );
}

Post.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  preview: PropTypes.bool.isRequired,
};

export default injectIntl(Post);

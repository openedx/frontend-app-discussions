import React from 'react';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';
import { Locked, People } from '@edx/paragon/icons';

import { StarFilled, StarOutline } from '../../../components/icons';
import { updateExistingThread } from '../data/thunks';
import LikeButton from './LikeButton';
import messages from './messages';
import { postShape } from './proptypes';

const PostFooter = ({
  intl,
  post,
  userHasModerationPrivileges,
}) => {
  const dispatch = useDispatch();
  return (
    <div className="d-flex align-items-center ml-n1.5 mt-10px" style={{ height: '32px' }} data-testid="post-footer">
      {post.voteCount !== 0 && (
        <LikeButton
          count={post.voteCount}
          onClick={() => dispatch(updateExistingThread(post.id, { voted: !post.voted }))}
          voted={post.voted}
        />
      )}
      {post.following && (
        <OverlayTrigger
          overlay={(
            <Tooltip id={`follow-${post.id}-tooltip`}>
              {intl.formatMessage(post.following ? messages.unFollow : messages.follow)}
            </Tooltip>
          )}
        >
          <IconButton
            src={post.following ? StarFilled : StarOutline}
            onClick={(e) => {
              e.preventDefault();
              dispatch(updateExistingThread(post.id, { following: !post.following }));
              return true;
            }}
            iconAs={Icon}
            iconClassNames="follow-icon-dimentions"
            className="post-footer-icon-dimentions"
            alt="Follow"
          />
        </OverlayTrigger>
      )}
      <div className="d-flex flex-fill justify-content-end align-items-center">
        {post.groupId && userHasModerationPrivileges && (
          <OverlayTrigger
            overlay={(
              <Tooltip id={`visibility-${post.id}-tooltip`}>{post.groupName}</Tooltip>
            )}
          >
            <span data-testid="cohort-icon">
              <Icon
                src={People}
                style={{
                  width: '22px',
                  height: '20px',
                }}
                className="text-gray-500"
              />
            </span>
          </OverlayTrigger>
        )}

        {post.closed
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
                className="text-primary-500"
                style={{
                  width: '1rem',
                  height: '1rem',
                  marginLeft: '19.5px',
                }}
              />
            </OverlayTrigger>
          )}
      </div>
    </div>
  );
};

PostFooter.propTypes = {
  intl: intlShape.isRequired,
  post: postShape.isRequired,
  userHasModerationPrivileges: PropTypes.bool.isRequired,
};

export default injectIntl(PostFooter);

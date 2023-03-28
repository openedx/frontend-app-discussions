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

function PostFooter({
  intl,
  voteCount,
  voted,
  following,
  id,
  groupId,
  groupName,
  closed,
  userHasModerationPrivileges,
}) {
  const dispatch = useDispatch();

  return (
    <div className="d-flex align-items-center ml-n1.5 mt-10px" style={{ height: '32px' }} data-testid="post-footer">
      {voteCount !== 0 && (
        <LikeButton
          count={voteCount}
          onClick={() => dispatch(updateExistingThread(id, { voted: !voted }))}
          voted={voted}
        />
      )}
      {following && (
        <OverlayTrigger
          overlay={(
            <Tooltip id={`follow-${id}-tooltip`}>
              {intl.formatMessage(following ? messages.unFollow : messages.follow)}
            </Tooltip>
          )}
        >
          <IconButton
            src={following ? StarFilled : StarOutline}
            onClick={(e) => {
              e.preventDefault();
              dispatch(updateExistingThread(id, { following: !following }));
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
        {groupId && userHasModerationPrivileges && (
          <OverlayTrigger
            overlay={(
              <Tooltip id={`visibility-${id}-tooltip`}>{groupName}</Tooltip>
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
        {closed && (
          <OverlayTrigger
            overlay={(
              <Tooltip id={`closed-${id}-tooltip`}>
                {intl.formatMessage(messages.postClosed)}
              </Tooltip>
            )}
          >
            <Icon
              src={Locked}
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
}

PostFooter.propTypes = {
  intl: intlShape.isRequired,
  voteCount: PropTypes.number.isRequired,
  voted: PropTypes.bool.isRequired,
  following: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string,
  groupName: PropTypes.string,
  closed: PropTypes.bool.isRequired,
  userHasModerationPrivileges: PropTypes.bool.isRequired,
};

PostFooter.defaultProps = {
  groupId: null,
  groupName: null,
};

export default injectIntl(React.memo(PostFooter));

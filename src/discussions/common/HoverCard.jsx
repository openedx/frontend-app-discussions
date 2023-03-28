import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';

import {
  StarFilled, StarOutline, ThumbUpFilled, ThumbUpOutline,
} from '../../components/icons';
import { useUserCanAddThreadInBlackoutDate } from '../data/hooks';
import ActionsDropdown from './ActionsDropdown';
import { DiscussionContext } from './context';

function HoverCard({
  intl,
  type,
  PostOrCommentId,
  actionHandlers,
  handleResponseCommentButton,
  addResponseCommentButtonMessage,
  onLike,
  onFollow,
  voted,
  following,
  isClosedPost,
  endorseIcons,
}) {
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();

  return (
    <div
      className="flex-fill justify-content-end align-items-center hover-card mr-n4 position-absolute"
      data-testid={`hover-card-${PostOrCommentId}`}
      id={`hover-card-${PostOrCommentId}`}
    >
      {userCanAddThreadInBlackoutDate && (
        <div className="d-flex">
          <Button
            variant="tertiary"
            className={classNames('px-2.5 py-2 border-0 font-style text-gray-700 font-size-12',
              { 'w-100': enableInContextSidebar })}
            onClick={() => handleResponseCommentButton()}
            disabled={isClosedPost}
            style={{ lineHeight: '20px' }}
          >
            {addResponseCommentButtonMessage}
          </Button>
        </div>
      )}
      {endorseIcons && (
        <div className="hover-button">
          <OverlayTrigger
            overlay={(
              <Tooltip id="endorsed-icon-tooltip">
                {intl.formatMessage(endorseIcons.label)}
              </Tooltip>
            )}
            trigger={['hover', 'focus']}
          >
            <IconButton
              src={endorseIcons.icon}
              iconAs={Icon}
              onClick={() => {
                const actionFunction = actionHandlers[endorseIcons.action];
                actionFunction();
              }}
              className={['endorse', 'unendorse'].includes(endorseIcons.id) ? 'text-dark-500' : 'text-success-500'}
              size="sm"
              alt="Endorse"
            />
          </OverlayTrigger>
        </div>
      )}
      <div className="hover-button">
        <IconButton
          src={voted ? ThumbUpFilled : ThumbUpOutline}
          iconAs={Icon}
          size="sm"
          alt="Like"
          iconClassNames="like-icon-dimentions"
          onClick={(e) => {
            e.preventDefault();
            onLike();
          }}
        />
      </div>
      {following !== undefined && (
        <div className="hover-button">
          <IconButton
            src={following ? StarFilled : StarOutline}
            iconAs={Icon}
            size="sm"
            alt="Follow"
            iconClassNames="follow-icon-dimentions"
            onClick={(e) => {
              e.preventDefault();
              onFollow();
            }}
          />
        </div>
      )}
      <div className="hover-button ml-auto">
        <ActionsDropdown
          PostOrCommentId={PostOrCommentId}
          actionHandlers={actionHandlers}
          dropDownIconSize
          type={type}
        />
      </div>
    </div>
  );
}

HoverCard.propTypes = {
  intl: intlShape.isRequired,
  PostOrCommentId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  handleResponseCommentButton: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onFollow: PropTypes.func,
  addResponseCommentButtonMessage: PropTypes.string.isRequired,
  isClosedPost: PropTypes.bool.isRequired,
  endorseIcons: PropTypes.objectOf(PropTypes.any),
  voted: PropTypes.bool.isRequired,
  following: PropTypes.bool,
};

HoverCard.defaultProps = {
  onFollow: () => null,
  endorseIcons: null,
  following: undefined,
};

export default injectIntl(React.memo(HoverCard));

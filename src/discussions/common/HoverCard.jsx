import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';

import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';

import {
  StarFilled, StarOutline, ThumbUpFilled, ThumbUpOutline,
} from '../../components/icons';
import { useUserCanAddThreadInBlackoutDate } from '../data/hooks';
import { PostCommentsContext } from '../post-comments/postCommentsContext';
import ActionsDropdown from './ActionsDropdown';
import { DiscussionContext } from './context';

const HoverCard = ({
  id,
  contentType,
  actionHandlers,
  handleResponseCommentButton,
  addResponseCommentButtonMessage,
  onLike,
  onFollow,
  voted,
  following,
  endorseIcons,
}) => {
  console.log('HoverCard');

  const intl = useIntl();
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const { isClosed } = useContext(PostCommentsContext);
  const userCanAddThreadInBlackoutDate = useUserCanAddThreadInBlackoutDate();

  return (
    <div
      className="flex-fill justify-content-end align-items-center hover-card mr-n4 position-absolute"
      data-testid={`hover-card-${id}`}
      id={`hover-card-${id}`}
    >
      {userCanAddThreadInBlackoutDate && (
        <div className="d-flex">
          <Button
            variant="tertiary"
            className={classNames('px-2.5 py-2 border-0 font-style text-gray-700 font-size-12',
              { 'w-100': enableInContextSidebar })}
            onClick={() => handleResponseCommentButton()}
            disabled={isClosed}
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
          id={id}
          contentType={contentType}
          actionHandlers={actionHandlers}
          dropDownIconSize
        />
      </div>
    </div>
  );
};

HoverCard.propTypes = {
  id: PropTypes.string.isRequired,
  contentType: PropTypes.string.isRequired,
  actionHandlers: PropTypes.objectOf(PropTypes.func).isRequired,
  handleResponseCommentButton: PropTypes.func.isRequired,
  addResponseCommentButtonMessage: PropTypes.string.isRequired,
  onLike: PropTypes.func.isRequired,
  voted: PropTypes.bool.isRequired,
  endorseIcons: PropTypes.objectOf(PropTypes.any),
  onFollow: PropTypes.func,
  following: PropTypes.bool,
};

HoverCard.defaultProps = {
  onFollow: () => null,
  endorseIcons: null,
  following: undefined,
};

export default React.memo(HoverCard);

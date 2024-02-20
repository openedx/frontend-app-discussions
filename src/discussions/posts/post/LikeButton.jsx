import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  Icon, IconButton, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { ThumbUpFilled, ThumbUpOutline } from '@openedx/paragon/icons';

import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const LikeButton = ({ count, onClick, voted }) => {
  const intl = useIntl();

  const handleClick = useCallback((e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div className="d-flex align-items-center mr-36px text-primary-500">
      <OverlayTrigger
        overlay={(
          <Tooltip id={`liked-${count}-tooltip`}>
            {intl.formatMessage(voted ? messages.removeLike : messages.like)}
          </Tooltip>
        )}
      >
        <IconButton
          src={voted ? ThumbUpFilled : ThumbUpOutline}
          onClick={handleClick}
          className="post-footer-icon-dimensions"
          alt="Like"
          iconAs={Icon}
          iconClassNames="like-icon-dimensions"
        />
      </OverlayTrigger>
      <div className="font-style">
        {(count && count > 0) ? count : null}
      </div>

    </div>
  );
};

LikeButton.propTypes = {
  count: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  voted: PropTypes.bool,
};

LikeButton.defaultProps = {
  voted: false,
  onClick: undefined,
};

export default React.memo(LikeButton);

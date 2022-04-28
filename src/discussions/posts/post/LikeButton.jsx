import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Icon, IconButton, OverlayTrigger, Tooltip,
} from '@edx/paragon';

import { ThumbUpFilled, ThumbUpOutline } from '../../../components/icons';
import messages from './messages';

function LikeButton({
  count,
  intl,
  onClick,
  voted,
}) {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    return false;
  };

  return (
    <div className="d-flex align-items-center align-content-center mr-4.5">
      <OverlayTrigger
        overlay={(
          <Tooltip id={`like-${count}-tooltip`}>
            {intl.formatMessage(voted ? messages.removeLike : messages.like)}
          </Tooltip>
        )}
      >
        <IconButton
          onClick={handleClick}
          className="p-3 mr-2 mt-1"
          alt="Like"
          iconAs={Icon}
          size="inline"
          src={voted ? ThumbUpFilled : ThumbUpOutline}
        />
      </OverlayTrigger>
      {(count && count > 0) ? count : null}
    </div>
  );
}

LikeButton.propTypes = {
  count: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
  onClick: PropTypes.func,
  voted: PropTypes.bool,
};

LikeButton.defaultProps = {
  voted: false,
  onClick: undefined,
};

export default injectIntl(LikeButton);

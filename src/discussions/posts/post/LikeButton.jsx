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
          className="post-footer-icon-dimentions"
          alt="Like"
          iconAs={Icon}
          iconClassNames="like-icon-dimentions"
        />
      </OverlayTrigger>
      <div className="font-style">
        {(count && count > 0) ? count : null}
      </div>

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

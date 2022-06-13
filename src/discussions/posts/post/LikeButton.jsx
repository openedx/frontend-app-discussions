import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButtonWithTooltip } from '@edx/paragon';

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
    <div className="d-flex align-items-center mr-4">
      <IconButtonWithTooltip
        id={`like-${count}-tooltip`}
        tooltipPlacement="top"
        tooltipContent={intl.formatMessage(voted ? messages.removeLike : messages.like)}
        src={voted ? ThumbUpFilled : ThumbUpOutline}
        iconAs={Icon}
        alt="Like"
        onClick={handleClick}
        size="inline"
        className="p-3 mr-0.5"
        iconClassNames="icon-size"
      />
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

import React from 'react';
import propTypes from 'prop-types';

import classNames from 'classnames';

import { Button } from '@edx/paragon';

import { ReactComponent as EmptyIcon } from '../../assets/empty.svg';

function EmptyPage({
  title,
  subTitle = null,
  action = null,
  actionText = null,
  fullWidth = false,
}) {
  const containerClasses = classNames(
    'min-content-height justify-content-center align-items-center d-flex w-100 flex-column pt-5',
    { 'bg-light-400': !fullWidth },
  );

  return (
    <div className={containerClasses}>
      <div className="d-flex flex-column align-items-center">
        <EmptyIcon />
        <h3 className="pt-3">{title}</h3>
        {subTitle && <p className="pb-2">{subTitle}</p>}
        {action && actionText && (
          <Button onClick={action} variant="outline-dark">
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
}

EmptyPage.propTypes = {
  title: propTypes.string.isRequired,
  subTitle: propTypes.string,
  action: propTypes.func,
  actionText: propTypes.string,
  fullWidth: propTypes.bool,
};

EmptyPage.defaultProps = {
  subTitle: null,
  action: null,
  fullWidth: false,
  actionText: null,
};

export default EmptyPage;

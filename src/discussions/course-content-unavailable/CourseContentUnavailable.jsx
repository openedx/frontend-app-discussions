import React, { useCallback } from 'react';
import propTypes from 'prop-types';

import classNames from 'classnames';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';

import ContentUnavailableIcon from '../../assets/ContentUnavailable';
import { useIsOnDesktop, useIsOnXLDesktop } from '../data/hooks';
import messages from '../messages';

const CourseContentUnavailable = ({ subTitleMessage }) => {
  const intl = useIntl();
  const isOnDesktop = useIsOnDesktop();
  const isOnXLDesktop = useIsOnXLDesktop();

  const redirectToDashboard = useCallback(() => {
    window.location.replace(`${getConfig().LMS_BASE_URL}/dashboard`);
  }, []);

  return (
    <div className="min-content-height justify-content-center align-items-center d-flex w-100 flex-column bg-white">
      <div className={classNames('d-flex flex-column align-items-center', {
        'content-unavailable-desktop': isOnDesktop || isOnXLDesktop,
        'content-unavailable-mobile': !isOnDesktop && !isOnXLDesktop,
      })}
      >
        <ContentUnavailableIcon />
        <h3 className="pt-3 font-weight-bold text-primary-500 text-center">{intl.formatMessage(messages.contentUnavailableTitle)}</h3>
        <p className="pb-2 text-gray-500 text-center">{intl.formatMessage(subTitleMessage)}</p>
        <Button onClick={redirectToDashboard} variant="outline-dark" className="font-size-14 py-2 px-2.5">
          {intl.formatMessage(messages.contentUnavailableAction)}
        </Button>
      </div>
    </div>
  );
};

CourseContentUnavailable.propTypes = {
  subTitleMessage: propTypes.shape({
    id: propTypes.string,
    defaultMessage: propTypes.string,
    description: propTypes.string,
  }).isRequired,
};

export default React.memo(CourseContentUnavailable);

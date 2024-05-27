import React, { useCallback } from 'react';
import propTypes from 'prop-types';

import { Button } from '@openedx/paragon';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import ContentUnavailableIcon from '../../assets/ContentUnavailable';
import selectCourseTabs from '../../components/NavigationBar/data/selectors';
import { useIsOnTablet, useIsOnXLDesktop } from '../data/hooks';
import messages from '../messages';

const ContentUnavailable = ({ subTitleMessage }) => {
  const intl = useIntl();
  const isOnTabletorDesktop = useIsOnTablet();
  const isOnXLDesktop = useIsOnXLDesktop();
  const { courseId } = useSelector(selectCourseTabs);

  const redirectToDashboard = useCallback(() => {
    window.location.replace(`${getConfig().LMS_BASE_URL}/courses/${courseId}/about`);
  }, [courseId]);

  return (
    <div className="min-content-height justify-content-center align-items-center d-flex w-100 flex-column bg-white">
      <div className={classNames('d-flex flex-column align-items-center', {
        'content-unavailable-desktop': isOnTabletorDesktop || isOnXLDesktop,
        'py-0 px-3': !isOnTabletorDesktop && !isOnXLDesktop,
      })}
      >
        <ContentUnavailableIcon />
        <h3 className="pt-3 font-weight-bold text-primary-500 text-center">
          {intl.formatMessage(messages.contentUnavailableTitle)}
        </h3>
        <p className="pb-2 text-gray-500 text-center">{intl.formatMessage(subTitleMessage)}</p>
        <Button onClick={redirectToDashboard} variant="outline-dark" className="py-2 px-2.5">
          {intl.formatMessage(messages.contentUnavailableAction)}
        </Button>
      </div>
    </div>
  );
};

ContentUnavailable.propTypes = {
  subTitleMessage: propTypes.shape({
    id: propTypes.string,
    defaultMessage: propTypes.string,
    description: propTypes.string,
  }).isRequired,
};

export default React.memo(ContentUnavailable);

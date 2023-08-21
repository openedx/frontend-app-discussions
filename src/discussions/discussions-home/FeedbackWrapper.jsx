import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { getConfig } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';

import { RequestStatus } from '../../data/constants';
import {
  selectconfigLoadingStatus,
  selectIsCourseAdmin,
  selectIsCourseStaff,
  selectUserIsGroupTa,
  selectUserIsStaff,
} from '../data/selectors';

export default function useFeedbackWrapper() {
  const isStaff = useSelector(selectUserIsStaff);
  const isUserGroupTA = useSelector(selectUserIsGroupTa);
  const isCourseAdmin = useSelector(selectIsCourseAdmin);
  const isCourseStaff = useSelector(selectIsCourseStaff);
  const configStatus = useSelector(selectconfigLoadingStatus);

  useEffect(() => {
    if (configStatus === RequestStatus.SUCCESSFUL) {
      let url = getConfig().LEARNER_FEEDBACK_URL;
      if (isStaff || isUserGroupTA || isCourseAdmin || isCourseStaff) {
        url = getConfig().STAFF_FEEDBACK_URL;
      }
      try {
        // eslint-disable-next-line no-undef
        window.usabilla_live = lightningjs.require('usabilla_live', url);
      } catch (err) {
        logError(err);
      }
    }
  }, [configStatus]);
}

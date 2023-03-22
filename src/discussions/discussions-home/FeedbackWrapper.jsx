import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { logError } from '@edx/frontend-platform/logging';

import {
  selectIsCourseAdmin,
  selectIsCourseStaff,
  selectUserIsGroupTa,
  selectUserIsStaff,
  selectconfigLoadingStatus
} from '../data/selectors';
import { RequestStatus } from '../../data/constants';

export default function useFeedbackWrapper() {
  const isStaff = useSelector(selectUserIsStaff);
  const isUserGroupTA = useSelector(selectUserIsGroupTa);
  const isCourseAdmin = useSelector(selectIsCourseAdmin);
  const isCourseStaff = useSelector(selectIsCourseStaff);
  const configStatus = useSelector(selectconfigLoadingStatus);

  useEffect(() => {
    if (configStatus === RequestStatus.SUCCESSFUL) {
      let url = '//w.usabilla.com/9e6036348fa1.js';
      if (isStaff || isUserGroupTA || isCourseAdmin || isCourseStaff) {
        url = '//w.usabilla.com/767740a06856.js';
      }
      try {
        // eslint-disable-next-line no-undef
        window.usabilla_live = lightningjs.require('usabilla_live', url);
      } catch (err) {
        logError(err);
      }
    }
  }, [isStaff, isUserGroupTA, isCourseAdmin, isCourseStaff, configStatus]);
}

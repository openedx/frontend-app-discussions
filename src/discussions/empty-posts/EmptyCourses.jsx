import React from 'react';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {   matchPath} from 'react-router-dom';
import { useIsOnDesktop } from '../data/hooks';
import EmptyPage from './EmptyPage';
import { Routes } from "../../data/constants";
import CoursesComments from '../courses/CoursesComments';


function EmptyCourses({ intl }) {
  const isOnDesktop = useIsOnDesktop();

  if (!isOnDesktop) {
    return null;
  }
  const isCourseUrl = Boolean(matchPath(location.pathname, { path: Routes.COURSES.PATH[3] }))
  if (isCourseUrl){

   
    return <CoursesComments />
  }
  return (
    <EmptyPage  />
  );
}

EmptyCourses.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(EmptyCourses);

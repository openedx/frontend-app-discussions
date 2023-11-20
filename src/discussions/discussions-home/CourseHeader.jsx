import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import { LearningHeader } from '@edx/frontend-component-header';

import selectCourseTabs from '../../components/NavigationBar/data/selectors';
import withConditionalInContextRendering from '../common/withConditionalInContextRendering';

const CourseHeader = () => {
  const { courseNumber, courseTitle, org } = useSelector(selectCourseTabs);

  console.log('CourseHeader', courseNumber, courseTitle, org);

  return (courseNumber || courseTitle || org) && (
    <LearningHeader courseOrg={org} courseNumber={courseNumber} courseTitle={courseTitle} />
  );
};

export default memo(withConditionalInContextRendering(CourseHeader, false));

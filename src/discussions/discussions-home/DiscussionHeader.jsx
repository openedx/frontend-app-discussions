import React, { memo } from 'react';

import CourseTabsNavigation from '../../components/NavigationBar/CourseTabsNavigation';
import CourseHeader from './CourseHeader';

const DiscussionHeader = () => {
  console.log('DiscussionHeader');

  return (
    <>
      <CourseHeader />
      <CourseTabsNavigation />
    </>
  );
};

export default memo(DiscussionHeader);

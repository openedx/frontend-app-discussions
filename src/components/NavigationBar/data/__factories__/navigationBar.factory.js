import { Factory } from 'rosie';

import { getApiBaseUrl } from '../../../../data/constants';

Factory.define('navigationBar')
  .attr('can_show_upgrade_sock', null, false)
  .attr('can_view_certificate', null, false)
  .attr('celebrations', null, {
    first_section: false, streak_discount_enabled: false, streak_length_to_celebrate: null, weekly_goal: false,
  })
  .option('hasCourseAccess', null, true)

  .attr('course_access', ['hasCourseAccess'], (hasCourseAccess) => ({
    additional_context_user_message: null,
    developer_message: null,
    error_code: null,
    has_access: hasCourseAccess,
    user_fragment: null,
    user_message: null,
  }))
  .option('course_id', null, 'course-v1:edX+DemoX+Demo_Course')
  .sequence('is_enrolled', ['isEnrolled'], (idx, isEnrolled) => isEnrolled)
  .attr('is_self_paced', null, false)
  .attr('is_staff', null, true)
  .attr('number', null, 'DemoX')
  .attr('org', null, 'edX')
  .attr('original_user_is_staff', null, true)
  .attr('title', null, 'Demonstration Course')
  .attr('username', null, 'edx')
  .attr('tabs', ['course_id'], (idx, courseId) => [
    {
      tab_id: 'courseware',
      title: 'Course',
      url: `${getApiBaseUrl}/course/${courseId}/home`,
    },
    {
      tab_id: 'progress',
      title: 'Progress',
      url: `${getApiBaseUrl}/course/${courseId}/progress`,
    },
    {
      tab_id: 'discussion',
      title: 'Discussion',
      url: `${getApiBaseUrl}/course/${courseId}/discussion/forum/`,
    },
    {
      tab_id: 'instructor',
      title: 'Instructor',
      url: `${getApiBaseUrl}/course/${courseId}/instructor`,
    }]);

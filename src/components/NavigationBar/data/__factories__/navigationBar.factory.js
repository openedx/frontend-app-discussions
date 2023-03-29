import { Factory } from 'rosie';

import { getApiBaseUrl } from '../../../../data/constants';

Factory.define('navigationBar')
  .attr('can_show_upgrade_sock', null, false)
  .attr('can_view_certificate', null, false)
  .attr('celebrations', null, {
    first_section: false, streak_discount_enabled: false, streak_length_to_celebrate: null, weekly_goal: false,
  })
  .attr('course_access', null, {
    additional_context_user_message: null,
    developer_message: null,
    error_code: null,
    has_access: true,
    user_fragment: null,
    user_message: null,
  })
  .sequence('course_id', (idx) => `course-v1-${idx}`)
  .attr('is_enrolled', null, false)
  .attr('is_self_paced', null, false)
  .attr('is_staff', null, true)
  .attr('number', null, 'DemoX')
  .attr('org', null, 'edX')
  .attr('original_user_is_staff', null, true)
  .attr('title', null, 'Demonstration Course')
  .attr('username', null, 'edx')
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')

  .attr('tabs', ['courseId'], (idx, courseId) => [
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

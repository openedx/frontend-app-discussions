import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sorted_by: {
    id: 'discussions.topics.sort.message',
    defaultMessage: 'Sorted by {sortBy}',
    description: 'Display text used to indicate how topics are sorted',
  },
  sort_by_last_activity: {
    id: 'discussions.topics.sort.last-activity',
    defaultMessage: 'Recent activity',
    description: 'Option in dropdown to sort topics by recent activity',
  },
  sort_by_comment_count: {
    id: 'discussions.topics.sort.comment-count',
    defaultMessage: 'Most activity',
    description: 'Option in dropdown to sort topics by most activity',
  },
  sort_by_course_structure: {
    id: 'discussions.topics.sort.course-structure',
    defaultMessage: 'Course Structure',
    description: 'Option in dropdown to sort topics by course structure',
  },
});

export default messages;

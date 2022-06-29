import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  sortedBy: {
    id: 'discussions.topics.sort.message',
    defaultMessage: 'Sorted by {sortBy}',
    description: 'Display text used to indicate how topics are sorted',
  },
  sortByLastActivity: {
    id: 'discussions.topics.sort.lastActivity',
    defaultMessage: 'Recent activity',
    description: 'Option in dropdown to sort topics by recent activity',
  },
  sortByCommentCount: {
    id: 'discussions.topics.sort.commentCount',
    defaultMessage: 'Most activity',
    description: 'Option in dropdown to sort topics by most activity',
  },
  sortByCourseStructure: {
    id: 'discussions.topics.sort.courseStructure',
    defaultMessage: 'Course Structure',
    description: 'Option in dropdown to sort topics by course structure',
  },
  findATopic: {
    id: 'discussions.topics.find.label',
    defaultMessage: 'Find a topic',
    description: 'Placeholder text in search bar',
  },
  archivedTopics: {
    id: 'discussions.topics.archived.label',
    defaultMessage: 'Archived',
    description: 'Heading for displaying topics that are archived.',
  },
});

export default messages;

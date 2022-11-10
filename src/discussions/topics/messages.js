import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  discussions: {
    id: 'discussions.topics.discussions',
    defaultMessage: `{count, plural,
      =0 {Discussion}
      one {# Discussion}
      other {# Discussions}
    }`,
    description: 'Display tooltip text used to indicate how many posts type are discussion',
  },
  questions: {
    id: 'discussions.topics.questions',
    defaultMessage: `{count, plural,
      =0 {Question}
      one {# Question}
      other {# Questions}
    }`,
    description: 'Display tooltip text used to indicate how many posts type are questions',
  },
  reported: {
    id: 'discussions.topics.reported',
    defaultMessage: '{reported} reported',
    description: 'Display tooltip text used to indicate how many posts are reported',
  },
  previouslyReported: {
    id: 'discussions.topics.previouslyReported',
    defaultMessage: '{previouslyReported} previously reported',
    description: 'Display tooltip text used to indicate how many posts are previously reported',
  },
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
  searchTopics: {
    id: 'discussions.topics.find.label',
    defaultMessage: 'Search topics',
    description: 'Placeholder text in search bar',
  },
  archivedTopics: {
    id: 'discussions.topics.archived.label',
    defaultMessage: 'Archived',
    description: 'Heading for displaying topics that are archived.',
  },
  unnamedTopicCategories: {
    id: 'discussions.topics.unnamed.label',
    defaultMessage: 'Unnamed category',
    description: 'Text to display in place of topic name if topic name is empty',
  },
  unnamedTopicSubCategories: {
    id: 'discussions.subtopics.unnamed.label',
    defaultMessage: 'Unnamed subcategory',
    description: 'Text to display in place of topic name if topic name is empty',
  },
});

export default messages;

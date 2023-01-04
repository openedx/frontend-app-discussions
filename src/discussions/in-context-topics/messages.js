import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  backAlt: {
    id: 'discussions.topics.backAlt',
    defaultMessage: 'Back to topics list',
    description: 'Display back button text used to navigate back to topics list',
  },
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
  searchTopics: {
    id: 'discussions.topics.find.label',
    defaultMessage: 'Search topics',
    description: 'Placeholder text in search bar',
  },
  unnamedSection: {
    id: 'discussions.topics.unnamed.section.label',
    defaultMessage: 'Unnamed Section',
    description: 'Text to display in place of section name if section name is empty',
  },
  unnamedSubsection: {
    id: 'discussions.topics.unnamed.subsection.label',
    defaultMessage: 'Unnamed Subsection',
    description: 'Text to display in place of subsection name if subsection name is empty',
  },
  unnamedTopic: {
    id: 'discussions.subtopics.unnamed.topic.label',
    defaultMessage: 'Unnamed Topic',
    description: 'Text to display in place of topic name if topic name is empty',
  },
  noTopicExists: {
    id: 'discussions.topics.title',
    defaultMessage: 'No topic exists',
    description: 'Text to display in place of topic list if topic does not exist',
  },
  createTopic: {
    id: 'discussions.topics.createTopic',
    defaultMessage: 'Please contact you admin to create a topic',
    description: 'Helping Text to display in place of topic list if topic does not exist',
  },
  nothingHere: {
    id: 'discussions.topics.nothing',
    defaultMessage: 'Nothing here yet',
    description: 'Helping Text to display if nothing here yet',
  },
  archivedTopics: {
    id: 'discussions.topics.archived.label',
    defaultMessage: 'Archived',
    description: 'Heading for displaying topics that are archived.',
  },
});

export default messages;

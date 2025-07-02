import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  advanceButtonText: {
    id: 'tour.action.advance',
    defaultMessage: 'Next',
    description: 'Action to go to next step of tour',
  },
  dismissButtonText: {
    id: 'tour.action.dismiss',
    defaultMessage: 'Dismiss',
    description: 'Action to dismiss current tour',
  },
  endButtonText: {
    id: 'tour.action.end',
    defaultMessage: 'Okay',
    description: 'Action to end current tour',
  },
  notifyAllLearnersTourTitle: {
    id: 'tour.title.notifyAllLearners',
    defaultMessage: 'Let your learners know.',
    description: 'Title of the tour to notify all learners',
  },
  notifyAllLearnersTourBody: {
    id: 'tour.body.notifyAllLearners',
    defaultMessage: 'Check this box to notify all learners.',
    description: 'Body of the tour to notify all learners',
  },
});

export default messages;

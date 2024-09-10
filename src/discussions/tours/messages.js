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
  exampleTourTitle: {
    id: 'tour.example.title',
    defaultMessage: 'Example Tour',
    description: 'Title for example tour',
  },
  exampleTourBody: {
    id: 'tour.example.body',
    defaultMessage: 'This is an example tour',
    description: 'Body for example tour',
  },
});

export default messages;

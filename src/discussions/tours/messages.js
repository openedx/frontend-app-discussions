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
  notRespondedFilterTourBody: {
    id: 'tour.body.notRespondedFilter',
    defaultMessage: 'Now you can filter discussions to find posts with no response.',
    description: 'Body of the tour for the not responded filter',
  },
  notRespondedFilterTourTitle: {
    id: 'tour.title.notRespondedFilter',
    defaultMessage: 'New filtering option!',
    description: 'Title of the tour for the not responded filter',
  },
  responseSortTourBody: {
    id: 'tour.body.responseSortTour',
    defaultMessage: 'Responses and comments are now sorted by newest first. Please use this option to change the sort order',
    description: 'Body of the tour for the response sort',
  },
  responseSortTourTitle: {
    id: 'tour.title.responseSortTour',
    defaultMessage: 'Sort Responses!',
    description: 'Title of the tour for the response sort',
  },
});

export default messages;

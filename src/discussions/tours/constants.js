import messages from './messages';

export default function tourCheckpoints(intl) {
  return {
    NOT_RESPONDED_FILTER: [
      {
        body: intl.formatMessage(messages.notRespondedFilterTourBody),
        placement: 'right',
        target: '#icon-tune',
        title: intl.formatMessage(messages.notRespondedFilterTourTitle),
      },
    ],
  };
}

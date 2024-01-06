import messages from './messages';

/**
 *
 * @param {Object} intl
 * @returns {Object} tour checkpoints
 */
export default function tourCheckpoints(intl) {
  return {
    EXAMPLE_TOUR: [
      {
        title: intl.formatMessage(messages.exampleTourTitle),
        body: intl.formatMessage(messages.exampleTourBody),
        target: '#example-tour-target',
        placement: 'bottom',
      },
    ],
  };
}

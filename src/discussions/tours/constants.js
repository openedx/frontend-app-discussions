import messages from './messages';

/**
 *
 * @param {Object} intl
 * @returns {Object} tour checkpoints
 */
export default function tourCheckpoints(intl) {
  return {
    notify_all_learners: [
      {
        title: intl.formatMessage(messages.notifyAllLearnersTourTitle),
        body: intl.formatMessage(messages.notifyAllLearnersTourBody),
        target: '#notify-learners',
        placement: 'bottom',
      },
    ],
  };
}

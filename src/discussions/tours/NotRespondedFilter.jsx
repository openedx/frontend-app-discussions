import { useContext, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ProductTour } from '@edx/paragon';

import { DiscussionContext } from '../common/context';
import { notRespondedFilterTour } from './data/selectors';
import { fetchDiscussionTours, updateTourShowStatus } from './data/thunks';
import messages from './messages';

function NotRespondedFilterTour({ intl }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchDiscussionTours());
  }, []);
  const tourData = useSelector(notRespondedFilterTour);
  const { enableInContextSidebar } = useContext(DiscussionContext);
  const config = {
    tourId: 'notRespondedTour',
    advanceButtonText: intl.formatMessage(messages.advanceButtonText),
    dismissButtonText: intl.formatMessage(messages.dismissButtonText),
    endButtonText: intl.formatMessage(messages.endButtonText),
    enabled: tourData ? tourData.showTour && !enableInContextSidebar : false,
    onDismiss: () => dispatch(updateTourShowStatus(tourData.id)),
    onEnd: () => dispatch(updateTourShowStatus(tourData.id)),
    checkpoints: [
      {
        body: intl.formatMessage(messages.notRespondedFilterTourBody),
        placement: 'right',
        target: '#icon-tune',
        title: intl.formatMessage(messages.notRespondedFilterTourTitle),
      },

    ],
  };

  return (
    <>
      <ProductTour
        tours={[config]}
      />
    </>
  );
}

NotRespondedFilterTour.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NotRespondedFilterTour);

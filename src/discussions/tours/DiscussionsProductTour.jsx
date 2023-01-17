import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ProductTour } from '@edx/paragon';

import { useTourConfiguration } from '../data/hooks';
import { fetchDiscussionTours } from './data/thunks';

function DiscussionsProductTour({ intl }) {
  const dispatch = useDispatch();
  const config = useTourConfiguration(intl);
  useEffect(() => {
    dispatch(fetchDiscussionTours());
  }, []);

  return (
    <>
      {config.length && (
        <ProductTour
          tours={config}
        />
      )}
    </>
  );
}

DiscussionsProductTour.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionsProductTour);

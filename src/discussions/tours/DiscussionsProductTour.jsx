import { useEffect } from 'react';

import isEmpty from 'lodash/isEmpty';
import { useDispatch } from 'react-redux';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { ProductTour } from '@edx/paragon';

import { useTourConfiguration } from '../data/hooks';
import { fetchDiscussionTours } from './data/thunks';

const DiscussionsProductTour = ({ intl }) => {
  const dispatch = useDispatch();
  const config = useTourConfiguration(intl);
  useEffect(() => {
    dispatch(fetchDiscussionTours());
  }, []);

  return (
    !isEmpty(config) && (
      <ProductTour
        tours={config}
      />
    )
  );
};

DiscussionsProductTour.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionsProductTour);

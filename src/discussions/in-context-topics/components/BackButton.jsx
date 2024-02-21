import React from 'react';
import PropTypes from 'prop-types';

import { Icon, IconButton, Spinner } from '@openedx/paragon';
import { ArrowBack } from '@openedx/paragon/icons';
import { useNavigate } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from '../messages';

const BackButton = ({
  intl, path, title, loading,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="d-flex py-2.5 px-3 font-weight-bold border-light-400 border-bottom">
        <IconButton
          src={ArrowBack}
          iconAs={Icon}
          style={{ padding: '18px' }}
          size="inline"
          onClick={() => navigate(path)}
          alt={intl.formatMessage(messages.backAlt)}
        />
        <div className="d-flex flex-fill justify-content-center align-items-center mr-4.5">
          {loading ? <Spinner animation="border" variant="primary" size="sm" /> : title}
        </div>
      </div>
      <div className="border-bottom border-light-400" />
    </>
  );
};

BackButton.propTypes = {
  intl: intlShape.isRequired,
  path: PropTypes.shape({}).isRequired,
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

BackButton.defaultProps = {
  loading: false,
};

export default injectIntl(BackButton);

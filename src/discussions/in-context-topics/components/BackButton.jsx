import React from 'react';
import PropTypes from 'prop-types';

import { useHistory } from 'react-router-dom';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Icon, IconButton } from '@edx/paragon';
import { ArrowBack } from '@edx/paragon/icons';

import messages from '../messages';

function BackButton({ intl, path, title }) {
  const history = useHistory();

  return (
    <>
      <div className="d-flex py-2.5 px-3 font-weight-bold border-light-400 border-bottom">
        <IconButton
          src={ArrowBack}
          iconAs={Icon}
          style={{ padding: '18px' }}
          size="inline"
          onClick={() => history.push(path)}
          alt={intl.formatMessage(messages.backAlt)}
        />
        <div className="d-flex flex-fill justify-content-center align-items-center mr-4.5">
          {title}
        </div>
      </div>
      <div className="border-bottom border-light-400" />
    </>
  );
}

BackButton.propTypes = {
  intl: intlShape.isRequired,
  path: PropTypes.shape({}).isRequired,
  title: PropTypes.string.isRequired,
};

export default injectIntl(BackButton);

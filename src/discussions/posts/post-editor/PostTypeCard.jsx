import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Card, Form } from '@openedx/paragon';
import classNames from 'classnames';

import DiscussionContext from '../../common/context';

const PostTypeCard = ({
  value,
  type,
  selected,
  icon,
}) => {
  const { enableInContextSidebar } = useContext(DiscussionContext);
  // Need to use regular label since Form.Label doesn't support overriding htmlFor
  return (
    <label htmlFor={`post-type-${value}`} className="d-flex p-0 my-0 mr-3">
      <Form.Radio value={value} id={`post-type-${value}`} className="sr-only">{type}</Form.Radio>
      <Card
        className={classNames('shadow-none', {
          'border-primary-500-2': selected,
          'border-light-400-2': !selected,
        })}
        style={{ cursor: 'pointer', width: `${enableInContextSidebar ? '10.021rem' : '14.25rem'}` }}
      >
        <Card.Section className="px-4 py-3 d-flex flex-column align-items-center">
          <span className="text-primary-300 mb-0.5">{icon}</span>
          <span className="text-gray-700">{type}</span>
        </Card.Section>
      </Card>
    </label>
  );
};

PostTypeCard.propTypes = {
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  icon: PropTypes.element.isRequired,
};

export default React.memo(PostTypeCard);

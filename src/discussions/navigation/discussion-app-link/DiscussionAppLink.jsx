import PropTypes from 'prop-types';
import React from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { buildDiscussionsUrl } from '../../utils';

function DiscussionAppLink({
  to,
  urlParams,
  children,
  ...otherProps
}) {
  const { embed, view, courseId } = useParams();
  const path = buildDiscussionsUrl(to, {
    embed,
    view,
    courseId,
    ...urlParams,
  });

  return (
    <Link
      to={path}
      {...otherProps}
    >
      {children}
    </Link>
  );
}

DiscussionAppLink.propTypes = {
  to: PropTypes.string.isRequired,
  urlParams: PropTypes.objectOf(PropTypes.string).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default DiscussionAppLink;

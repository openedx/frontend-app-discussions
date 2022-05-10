import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

function Latex(props) {
  const node = React.createRef();
  const renderMath = () => {
    window.MathJax.Hub.Queue([
      'Typeset',
      window.MathJax.Hub,
      node.current,
    ]);
  };

  useEffect(() => {
    renderMath();
  });

  return (
    <div ref={node} style={{ overflow: 'scroll' }}>
      {props.children}
    </div>
  );
}

Latex.defaultProps = {
  children: null,
};

Latex.propTypes = {

  children: PropTypes.node,
};

export default Latex;

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import DOMPurify from 'dompurify';

import { logError } from '@edx/frontend-platform/logging';

const defaultSanitizeOptions = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['columnalign'],
};

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const sanitizedMath = DOMPurify.sanitize(htmlNode, { ...defaultSanitizeOptions });

  useEffect(() => {
    let promise = Promise.resolve(); // Used to hold chain of typesetting calls
    function typeset(code) {
      promise = promise.then(() => window.MathJax.typesetPromise(code()))
        .catch((err) => logError(`Typeset failed: ${err.message}`));
      return promise;
    }

    typeset(() => {
      const math = document.querySelector('#tex2jax_process');
      math.innerHTML = sanitizedMath;
      return [math];
    });
  }, [sanitizedMath]);

  return (
    <div className={cssClassName} id={componentId}>
      <div id="tex2jax_process" />
    </div>

  );
}

HTMLLoader.propTypes = {
  htmlNode: PropTypes.node,
  componentId: PropTypes.string,
  cssClassName: PropTypes.string,
};

HTMLLoader.defaultProps = {
  htmlNode: '',
  componentId: null,
  cssClassName: '',
};

export default HTMLLoader;

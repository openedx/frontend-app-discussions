import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import DOMPurify from 'dompurify';

import { logError } from '@edx/frontend-platform/logging';

const defaultSanitizeOptions = {
  USE_PROFILES: { html: true },
  ADD_ATTR: ['columnalign'],
};

function HTMLLoader({ htmlNode, componentId, cssClassName }) {
  const sanitizedMath = DOMPurify.sanitize(htmlNode, { ...defaultSanitizeOptions });
  const previewRef = useRef();

  useEffect(() => {
    let promise = Promise.resolve(); // Used to hold chain of typesetting calls
    function typeset(code) {
      promise = promise.then(() => window.MathJax.typesetPromise(code()))
        .catch((err) => logError(`Typeset failed: ${err.message}`));
      return promise;
    }

    typeset(() => {
      previewRef.current.innerHTML = sanitizedMath;
    });
  }, [sanitizedMath]);

  return (
    <div ref={previewRef} className={cssClassName} id={componentId} />

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

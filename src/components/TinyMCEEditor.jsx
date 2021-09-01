import React from 'react';

import { Editor } from '@tinymce/tinymce-react';
/* eslint import/no-webpack-loader-syntax: off */
import contentCss from 'tinymce/skins/content/default/content.min.css';
import contentUiCss from 'tinymce/skins/ui/oxide/content.min.css';
// TinyMCE so the global var exists
// eslint-disable-next-line no-unused-vars,import/no-extraneous-dependencies
import tinymce from 'tinymce/tinymce';

import 'tinymce/plugins/code';
// Theme
import 'tinymce/themes/silver';
// Toolbar icons
import 'tinymce/icons/default';
// Editor styles
import 'tinymce/skins/ui/oxide/skin.min.css';
// importing the plugin js.
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';

export default function TinyMCEEditor(props) {
  // note that skin and content_css is disabled to avoid the normal
  // loading process and is instead loaded as a string via content_style
  return (
    <Editor
      init={{
        skin: false,
        menubar: false,
        plugins: 'codesample link lists code',
        toolbar: 'formatselect | bold italic underline | link | bullist numlist outdent indent | code |',
        content_css: false,
        content_style: [contentCss, contentUiCss].join('\n'),
      }}
      {...props}
    />
  );
}

import React from 'react';

import { Editor } from '@tinymce/tinymce-react';
import { useParams } from 'react-router';
// TinyMCE so the global var exists
// eslint-disable-next-line no-unused-vars,import/no-extraneous-dependencies
import tinymce from 'tinymce/tinymce';

import { uploadFile } from '../discussions/posts/data/api';

import 'tinymce/plugins/code';
// Theme
import 'tinymce/themes/silver';
// Toolbar icons
import 'tinymce/icons/default';
// Editor styles
import 'tinymce/skins/ui/oxide/skin.css';
// importing the plugin js.
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/spellchecker';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import '@wiris/mathtype-tinymce5';
/* eslint import/no-webpack-loader-syntax: off */
// eslint-disable-next-line import/no-unresolved
import edxBrandCss from '!!raw-loader!sass-loader!../index.scss';
// eslint-disable-next-line import/no-unresolved
import contentCss from '!!raw-loader!tinymce/skins/content/default/content.min.css';
// eslint-disable-next-line import/no-unresolved
import contentUiCss from '!!raw-loader!tinymce/skins/ui/oxide/content.min.css';

const setup = (editor) => {
  editor.ui.registry.addButton('openedx_code', {
    icon: 'sourcecode',
    onAction: () => {
      editor.execCommand('CodeSample');
    },
  });
  editor.ui.registry.addButton('openedx_html', {
    text: 'HTML',
    onAction: () => {
      editor.execCommand('mceCodeEditor');
    },
  });
};

export default function TinyMCEEditor(props) {
  // note that skin and content_css is disabled to avoid the normal
  // loading process and is instead loaded as a string via content_style

  const { courseId, postId } = useParams();

  const uploadHandler = async (blobInfo, success, failure) => {
    try {
      const blob = blobInfo.blob();
      const filename = blobInfo.filename();
      const { location } = await uploadFile(blob, filename, courseId, postId || 'root');
      success(location);
    } catch (e) {
      failure(e.toString(), { remove: true });
    }
  };

  let contentStyle;
  // In the test environment this causes an error so set styles to empty since they aren't needed for testing.
  try {
    contentStyle = [contentCss, contentUiCss, edxBrandCss].join('\n');
  } catch (err) {
    contentStyle = '';
  }

  return (
    <Editor
      init={{
        skin: false,
        menubar: false,
        branding: false,
        contextmenu: false,
        browser_spellcheck: true,
        a11y_advanced_options: true,
        autosave_interval: '1s',
        autosave_restore_when_empty: true,
        external_plugins: {
          tiny_mce_wiris: 'node_modules/@wiris/mathtype-tinymce5/plugin.min.js',
        },
        plugins: 'autosave codesample link lists image imagetools code spellchecker emoticons',
        toolbar: 'formatselect | bold italic underline'
          + ' | link blockquote openedx_code image'
          + ' | bullist numlist outdent indent'
          + ' | removeformat'
          + ' | openedx_html'
          + ' | undo redo'
          + ' | emoticons'
          + ' | tiny_mce_wiris_formulaEditor | tiny_mce_wiris_formulaEditorChemistry',
        spellchecker_active: true,
        spellchecker_dialog: true,
        content_css: false,
        content_style: contentStyle,
        body_class: 'm-2',
        default_link_target: '_blank',
        target_list: false,
        images_upload_handler: uploadHandler,
        setup,
      }}
      {...props}
    />
  );
}

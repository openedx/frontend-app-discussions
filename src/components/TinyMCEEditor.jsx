import React, {
  useCallback, useContext, useMemo, useState,
} from 'react';

import { Editor } from '@tinymce/tinymce-react';
import { useParams } from 'react-router';
// TinyMCE so the global var exists
// eslint-disable-next-line no-unused-vars,import/no-extraneous-dependencies
import tinymce from 'tinymce/tinymce';

import { useIntl } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import { ActionRow, AlertModal, Button } from '@edx/paragon';

import { MAX_UPLOAD_FILE_SIZE } from '../data/constants';
import messages from '../discussions/messages';
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
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/paste';

/* istanbul ignore next */
const TinyMCEEditor = (props) => {
  const intl = useIntl();
  const { courseId, postId } = useParams();
  const [showImageWarning, setShowImageWarning] = useState(false);
  const { paragonTheme } = useContext(AppContext);

  /* istanbul ignore next */
  const setup = useCallback((editor) => {
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
  }, []);

  const uploadHandler = useCallback(async (blobInfo, success, failure) => {
    try {
      const blob = blobInfo.blob();
      const imageSize = blobInfo.blob().size / 1024;
      if (imageSize > MAX_UPLOAD_FILE_SIZE) {
        failure(`Images size should not exceed ${MAX_UPLOAD_FILE_SIZE} KB`);
        return;
      }
      const filename = blobInfo.filename();
      const { location } = await uploadFile(blob, filename, courseId, postId || 'root');
      const img = new Image();
      img.onload = () => {
        if (img.height > 999 || img.width > 999) { setShowImageWarning(true); }
      };
      img.src = location;
      success(location);
    } catch (e) {
      failure(e.toString(), { remove: true });
    }
  }, [courseId, postId]);

  const handleClose = useCallback(() => {
    setShowImageWarning(false);
  }, []);

  // The tinyMCE editor runs in an iframe so the paragon styling will not apply to editor content by default.
  // This code extracts the links to the stylesheets loaded into the MFE and passes them along to the editor so the
  // content styling can be seamless.
  const themeCss = useMemo(
    () => ['paragon-theme-core', 'paragon-theme-variant', 'brand-theme-core', 'brand-theme-variant']
      .map(selector => document.querySelector(`link[rel=stylesheet][data-${selector}]`)?.href)
      .filter(item => item !== null),
    [paragonTheme?.state?.themeVariant],
  );

  return (
    <>
      <Editor
        init={{
          skin: false,
          menubar: false,
          branding: false,
          paste_data_images: false,
          contextmenu: false,
          browser_spellcheck: true,
          a11y_advanced_options: true,
          autosave_interval: '1s',
          autosave_restore_when_empty: false,
          plugins: 'autoresize autosave codesample link lists image imagetools code emoticons charmap paste',
          toolbar: 'undo redo'
                      + ' | formatselect | bold italic underline'
                      + ' | link blockquote openedx_code image'
                      + ' | bullist numlist outdent indent'
                      + ' | removeformat'
                      + ' | openedx_html'
                      + ' | emoticons'
                      + ' | charmap',
          content_css: themeCss,
          body_class: 'm-2 text-editor',
          convert_urls: false,
          relative_urls: false,
          default_link_target: '_blank',
          target_list: false,
          images_upload_handler: uploadHandler,
          setup,
        }}
        {...props}
      />
      <AlertModal
        title={intl.formatMessage(messages.imageWarningModalTitle)}
        isOpen={showImageWarning}
        onClose={handleClose}
        isBlocking
        footerNode={(
          <ActionRow>
            <Button variant="danger" onClick={handleClose}>
              {intl.formatMessage(messages.imageWarningDismissButton)}
            </Button>
          </ActionRow>
        )}
      >
        <p>
          {intl.formatMessage(messages.imageWarningMessage)}
        </p>
      </AlertModal>
    </>
  );
};

export default React.memo(TinyMCEEditor);

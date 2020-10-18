import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Form } from '@edx/paragon';
import { faComments, faQuestion, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PostEditor from '../post-editor/PostEditor';
import { cancelPostAdding } from '../data';

import messages from './messages';

function PostAdd({ intl }) {
  const dispatch = useDispatch();
  const cancelAdding = () => dispatch(cancelPostAdding());

  const [markdownOutput, setMarkdownOutput] = useState('');
  const onPostEditorChange = markdown => setMarkdownOutput(markdown);

  return (
    <div className="mx-4 my-2">
      <Form>
        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.type)}
          </Form.Label>
          <Form.Text className="mb-3" muted>
            {intl.formatMessage(messages.type_description)} ({intl.formatMessage(messages.required)})
          </Form.Text>

          <Form.Check inline type="radio" id="question">
            <Form.Check.Input type="radio" />
            <Form.Check.Label>
              <FontAwesomeIcon icon={faQuestion} />
              <span className="ml-2">{intl.formatMessage(messages.question_type)}</span>
            </Form.Check.Label>
          </Form.Check>

          <Form.Check inline type="radio" id="discussion">
            <Form.Check.Input type="radio" />
            <Form.Check.Label>
              <FontAwesomeIcon icon={faComments} />
              <span className="ml-2">{intl.formatMessage(messages.discussion_type)}</span>
            </Form.Check.Label>
          </Form.Check>
        </Form.Group>

        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.topic_area)}
          </Form.Label>
          <Form.Text id="topicAreaInput" muted>
            {intl.formatMessage(messages.topic_area_description)} ({intl.formatMessage(messages.required)})
          </Form.Text>
          <Form.Control
            as="select"
            defaultValue="General"
            aria-describedby="topicAreaInput"
          >
            <option>General</option>
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.title)}
          </Form.Label>
          <Form.Text id="titleInput" muted>
            {intl.formatMessage(messages.title_description)} ({intl.formatMessage(messages.required)})
          </Form.Text>
          <Form.Control type="text" aria-describedby="titleInput" />
        </Form.Group>

        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.question_text)}
          </Form.Label>
          <PostEditor onChange={onPostEditorChange} />
          <pre>{markdownOutput}</pre>
        </Form.Group>

        <Form.Group>
          <Form.Check inline type="checkbox" id="follow">
            <Form.Check.Input type="checkbox" />
            <Form.Check.Label>
              <FontAwesomeIcon icon={faStar} />
              <span className="ml-2">{intl.formatMessage(messages.follow_post)}</span>
            </Form.Check.Label>
          </Form.Check>

          <Form.Check inline type="checkbox" id="anonymous">
            <Form.Check.Input type="checkbox" />
            <Form.Check.Label>
              <span className="ml-2">{intl.formatMessage(messages.anonymous_post)}</span>
            </Form.Check.Label>
          </Form.Check>
        </Form.Group>

        <Button className="rounded-lg" variant="info">
          {intl.formatMessage(messages.submit)}
        </Button>
        <Button className="rounded-lg ml-2" variant="outline-info" onClick={cancelAdding}>
          {intl.formatMessage(messages.cancel)}
        </Button>
      </Form>
    </div>
  );
}

PostAdd.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostAdd);

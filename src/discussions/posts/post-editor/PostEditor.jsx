import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, Form } from '@edx/paragon';
import { faComments, faQuestion, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { hidePostEditor } from '../data';

import messages from './messages';

function PostEditor({ intl }) {
  const dispatch = useDispatch();
  const cancelAdding = () => dispatch(hidePostEditor());

  return (
    <div className="mx-4 my-2">
      <Form>
        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.type)}
          </Form.Label>
          <Form.Text className="mb-3" muted>
            {intl.formatMessage(messages.typeDescription)} ({intl.formatMessage(messages.required)})
          </Form.Text>

          <Form.Check inline type="radio" id="question">
            <Form.Check.Input type="radio" />
            <Form.Check.Label>
              <FontAwesomeIcon icon={faQuestion} />
              <span className="ml-2">{intl.formatMessage(messages.questionType)}</span>
            </Form.Check.Label>
          </Form.Check>

          <Form.Check inline type="radio" id="discussion">
            <Form.Check.Input type="radio" />
            <Form.Check.Label>
              <FontAwesomeIcon icon={faComments} />
              <span className="ml-2">{intl.formatMessage(messages.discussionType)}</span>
            </Form.Check.Label>
          </Form.Check>
        </Form.Group>

        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.topicArea)}
          </Form.Label>
          <Form.Text id="topicAreaInput" muted>
            {intl.formatMessage(messages.topicAreaDescription)} ({intl.formatMessage(messages.required)})
          </Form.Text>
          <Form.Control
            as="select"
            defaultValue="General"
            aria-describedby="topicAreaInput"
          >
            {/* TODO: topics has to be filled in another PR */}
            <option>General</option>
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.title)}
          </Form.Label>
          <Form.Text id="titleInput" muted>
            {intl.formatMessage(messages.titleDescription)} ({intl.formatMessage(messages.required)})
          </Form.Text>
          <Form.Control type="text" aria-describedby="titleInput" />
        </Form.Group>

        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.questionText)}
          </Form.Label>
          <Form.Control as="textarea" rows="3" />
        </Form.Group>

        <Form.Group>
          <Form.Check inline type="checkbox" id="follow">
            <Form.Check.Input type="checkbox" />
            <Form.Check.Label>
              <FontAwesomeIcon icon={faStar} />
              <span className="ml-2">{intl.formatMessage(messages.followPost)}</span>
            </Form.Check.Label>
          </Form.Check>

          <Form.Check inline type="checkbox" id="anonymous">
            <Form.Check.Input type="checkbox" />
            <Form.Check.Label>
              <span className="ml-2">{intl.formatMessage(messages.anonymousPost)}</span>
            </Form.Check.Label>
          </Form.Check>
        </Form.Group>

        <Button className="rounded-lg" variant="primary">
          {intl.formatMessage(messages.submit)}
        </Button>
        <Button className="rounded-lg ml-2" variant="outline-primary" onClick={cancelAdding}>
          {intl.formatMessage(messages.cancel)}
        </Button>
      </Form>
    </div>
  );
}

PostEditor.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PostEditor);

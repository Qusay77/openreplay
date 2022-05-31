import React, { useState } from 'react';
import { connect } from 'react-redux';
import { editSavedSearch as edit, save, remove } from 'Duck/search';
import { Button, Modal, Form, Icon, Checkbox, Input } from 'UI';
import { confirm } from 'UI';
import stl from './SaveSearchModal.module.css';
import cn from 'classnames';
import { toast } from 'react-toastify';

interface Props {
  filter: any;
  loading: boolean;
  edit: (filter: any) => void;
  save: (searchId) => Promise<void>;
  show: boolean;
  closeHandler: () => void;
  savedSearch: any;
  remove: (filterId: number) => Promise<void>;
  userId: number;
}
function SaveSearchModal(props: Props) {
  const { savedSearch, filter, loading, show, closeHandler } = props;
  const [name, setName] = useState(savedSearch ? savedSearch.name : '');

  const onNameChange = ({ target: { value } }) => {
    props.edit({ name: value });
    // setName(value);
  };

  const onSave = () => {
    const { filter, closeHandler } = props;
    // if (name.trim() === '') return;
    props.save(savedSearch.exists() ? savedSearch.searchId : null)
    .then(() => {
      // this.props.fetchFunnelsList();
      toast.success(`${savedSearch.exists() ? 'Updated' : 'Saved'} Successfully`);
      closeHandler();
    })
    .catch(e => {
      toast.error('Something went wrong, please try again');
    });
  }

  const onDelete = async () => {
    if (await confirm({
      header: 'Confirm',
      confirmButton: 'Yes, delete',
      confirmation: `Are you sure you want to permanently delete this Saved search?`,
    })) {
      props.remove(savedSearch.searchId).then(() => {
        closeHandler();
      });
    }
  }

  const onChangeOption = (e, { checked, name }) => props.edit({ [ name ]: checked })


  return (
    <Modal size="small" open={ show }>
      <Modal.Header className={ stl.modalHeader }>
        <div>{ 'Save Search' }</div>
        <Icon
          role="button"
          tabIndex="-1"
          color="gray-dark"
          size="18"
          name="close"
          onClick={ closeHandler }
        />
      </Modal.Header>

      <Modal.Content>
        <Form onSubmit={onSave}>
          <Form.Field>
            <label>{'Title:'}</label>
            <Input
              autoFocus={ true }
              // className={ stl.name }
              name="name"
              value={ savedSearch.name }
              onChange={ onNameChange }
              placeholder="Title"
            />
          </Form.Field>

          <Form.Field>
            <div className={cn("flex items-center", { 'disabled': savedSearch.exists() && savedSearch.userId !== props.userId })}>
              <Checkbox
                name="isPublic"
                className="font-medium mr-3"
                type="checkbox"
                checked={ savedSearch.isPublic }
                onClick={ onChangeOption }
              />
              <div
                className="flex items-center cursor-pointer"
                onClick={ () => props.edit({ 'isPublic' : !savedSearch.isPublic }) }
              >
                <Icon name="user-friends" size="16" />
                <span className="ml-2"> Team Visible</span>
              </div>
            </div>
          </Form.Field>
        </Form>
        { savedSearch.exists() && <div className="mt-4">Changes in filters will be updated.</div> }
      </Modal.Content>
      <Modal.Footer className="flex items-center px-6">
        <div className="mr-auto flex items-center">
          <Button
              variant="primary"
              onClick={ onSave }
              loading={ loading }
              disabled={!savedSearch.validate()}
              className="mr-2"
            >
              { savedSearch.exists() ? 'Update' : 'Create' }
            </Button>
            <Button onClick={ closeHandler }>{ 'Cancel' }</Button>
        </div>
        { savedSearch && <Button noPadding className={ stl.cancelButton } onClick={ onDelete }>
          <Icon name="trash" size="18" />
        </Button> }
      </Modal.Footer>
    </Modal>
  );
}

export default connect(state => ({
  userId: state.getIn([ 'user', 'account', 'id' ]),
  savedSearch: state.getIn([ 'search', 'savedSearch' ]),
  filter: state.getIn(['search', 'instance']),
  loading: state.getIn([ 'search', 'saveRequest', 'loading' ]) ||
    state.getIn([ 'search', 'updateRequest', 'loading' ]),
}), { edit, save, remove })(SaveSearchModal);

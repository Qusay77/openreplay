import React from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import withRequest from 'HOCs/withRequest';
import { Popup, Dropdown, Icon, Button } from 'UI';
import { pause } from 'Player';
import styles from './sharePopup.module.css';
import IntegrateSlackButton from '../IntegrateSlackButton/IntegrateSlackButton';
import SessionCopyLink from './SessionCopyLink';
import Select from 'Shared/Select';
import { Tooltip } from 'react-tippy';

@connect(state => ({
  channels: state.getIn([ 'slack', 'list' ]),
  tenantId: state.getIn([ 'user', 'account', 'tenantId' ]),
}))
@withRequest({
  endpoint: ({ id, entity }, integrationId) =>
    `/integrations/slack/notify/${ integrationId }/${entity}/${ id }`,
  method: "POST",
})
export default class SharePopup extends React.PureComponent {
  state = {
    comment: '',
    isOpen: true,
    channelId: this.props.channels.getIn([ 0, 'webhookId' ]),
  }

  editMessage = e => this.setState({ comment: e.target.value })
  share = () => this.props.request({ comment: this.state.comment }, this.state.channelId)
    .then(this.handleSuccess)

  handleOpen = () => {
    this.setState({ isOpen: true });
    pause();
    setTimeout(function() {
      document.getElementById('message').focus();
    }, 100)
  }

  handleClose = () => {
    this.setState({ isOpen: false, comment: '' });
  }

  handleSuccess = () => {
    toast.success('Sent to Slack.');
    this.handleClose();
  }

  changeChannel = ({ value }) => this.setState({ channelId: value })

  render() {
    const { trigger, loading, channels, showCopyLink = false } = this.props;
    const { comment, isOpen, channelId } = this.state;

    const options = channels.map(({ webhookId, name }) => ({ value: webhookId, label: name })).toJS();
    return (
      <Tooltip
        open={ isOpen }
        interactive
        // onOpen={ this.handleOpen }
        // onClose={ this.handleClose }
        content={
          <div className={ styles.wrapper }>
            <div className={ styles.header }>
              <div className={ styles.title }>Share this session link to Slack</div>
            </div>
            { options.length === 0 ?
              <>
                <div className={ styles.body }>
                  <IntegrateSlackButton />
                </div>
                { showCopyLink && (
                  <div className={styles.footer}>
                    <SessionCopyLink />
                  </div>
                )}
              </>
            :
              <div>
                <div className={ styles.body }>
                  <textarea
                    name="message"
                    id="message"
                    cols="30"
                    rows="4"
                    resize="none"
                    onChange={ this.editMessage }
                    value={ comment }
                    placeholder="Add Message (Optional)"
                    className="p-4"
                  />

                  <div className="flex items-center justify-between">
                    <Select
                      options={ options }
                      defaultValue={ channelId }
                      onChange={ this.changeChannel }
                      className="mr-4"
                    />
                    <div>
                      <Button
                        onClick={ this.share }
                        primary
                      >
                        <div className='flex items-center'>
                          <Icon name="integrations/slack-bw" size="18" marginRight="10" />
                          { loading ? 'Sending...' : 'Send' }
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className={ styles.footer }>
                  <SessionCopyLink />
                </div>

              </div>
            }
          </div>
        }
        // trigger="click"
        // position="top right"
        // className={ styles.popup }
        // hideOnScroll
      >
        {trigger}
      </Tooltip>
    );
  }
}

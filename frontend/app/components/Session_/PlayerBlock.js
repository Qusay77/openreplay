import React from 'react';
import cn from 'classnames';
import { connect } from 'react-redux';
import {} from 'Player';
import { NONE } from 'Duck/components/player';
import Player from './Player';
import styles from './playerBlock.module.css';

@connect((state) => ({
  fullscreen: state.getIn(['components', 'player', 'fullscreen']),
  bottomBlock: state.getIn(['components', 'player', 'bottomBlock']),
  sessionId: state.getIn(['sessions', 'current', 'sessionId']),
  disabled: state.getIn(['components', 'targetDefiner', 'inspectorMode']),
  jiraConfig: state.getIn(['issues', 'list']).first(),
}))
export default class PlayerBlock extends React.PureComponent {
  render() {
    const { fullscreen, bottomBlock, activeTab } = this.props;

    return (
      <div className={cn(styles.playerBlock, 'flex flex-col overflow-x-hidden')}>
        <Player
          className="flex-1"
          bottomBlockIsActive={!fullscreen && bottomBlock !== NONE}
          bottomBlock={bottomBlock}
          fullscreen={fullscreen}
          activeTab={activeTab}
        />
      </div>
    );
  }
}

import React, { useState } from 'react';
import EventsBlock from '../Session_/EventsBlock';
import { Controls as PlayerControls } from 'Player';
import { connectPlayer } from 'Player';
import cn from 'classnames';
import stl from './rightblock.module.css';

const EventsBlockConnected = connectPlayer((state) => ({
  currentTimeEventIndex: state.eventListNow.length > 0 ? state.eventListNow.length - 1 : 0,
  playing: state.playing,
}))(EventsBlock);

function RightBlock({ tabs, setActiveTab }) {
  const { EVENTS } = tabs;
  const [activeTab] = useState(EVENTS);
  const renderActiveTab = (tab) => {
    switch (tab) {
      case EVENTS:
        return <EventsBlockConnected setActiveTab={setActiveTab} player={PlayerControls} />;
    }
  };
  return (
    <div className={cn('flex flex-col bg-white border-l', stl.panel)}>
      {renderActiveTab(activeTab)}
    </div>
  );
}

export default React.memo(RightBlock);

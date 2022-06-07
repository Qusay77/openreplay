import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { sessions as sessionsRoute, assist as assistRoute, liveSession as liveSessionRoute, withSiteId } from 'App/routes';
import { Button, Icon, BackLink, Link } from 'UI';
import { toggleFavorite, setSessionPath } from 'Duck/sessions';
import cn from 'classnames';
import SharePopup from '../shared/SharePopup/SharePopup';
import { Icon, BackLink, Link } from 'UI';
import { connectPlayer, showEvents, toggleEvents } from 'Player';
import { fetchList as fetchListIntegration } from 'Duck/integrations/actions';
import SessionMetaList from 'Shared/SessionItem/SessionMetaList';
import UserCard from './EventsBlock/UserCard';
import Tabs from 'Components/Session/Tabs';

import stl from './playerBlockHeader.module.css';
import Issues from './Issues/Issues';
import AssistActions from '../Assist/components/AssistActions';
import AssistTabs from '../Assist/components/AssistTabs';

const SESSIONS_ROUTE = sessionsRoute();
const ASSIST_ROUTE = assistRoute();

@connectPlayer(state => ({
  width: state.width,
  height: state.height,
  live: state.live,
  loading: state.cssLoading || state.messagesLoading,
  showEvents: state.showEvents,
}), { toggleEvents })
@connect((state, props) => {
  const isAssist = window.location.pathname.includes('/assist/');
  const session = state.getIn([ 'sessions', 'current' ]);

  return {
    isAssist,
    session,
    sessionPath: state.getIn([ 'sessions', 'sessionPath' ]),
    loading: state.getIn([ 'sessions', 'toggleFavoriteRequest', 'loading' ]),
    disabled: state.getIn([ 'components', 'targetDefiner', 'inspectorMode' ]) || props.loading,
    local: state.getIn(['sessions', 'timezone']),
    funnelRef: state.getIn(['funnels', 'navRef']),
    siteId: state.getIn([ 'site', 'siteId' ]),
    metaList: state.getIn(['customFields', 'list']).map(i => i.key),
    closedLive: !!state.getIn([ 'sessions', 'errors' ]) || (isAssist && !session.live),
  }
}, {
  toggleFavorite, setSessionPath
})
@withRouter
export default class PlayerBlockHeader extends React.PureComponent {
  getDimension = (width, height) => {
    return width && height ? (
      <div className="flex items-center">
        { width || 'x' } <Icon name="close" size="12" className="mx-1" /> { height || 'x' }
      </div>
    ) : <span className="">Resolution N/A</span>;
  }

  backHandler = () => {
    const { history, siteId, sessionPath, isAssist } = this.props;
    if (sessionPath === history.location.pathname || sessionPath.includes("/session/") || isAssist) {
      history.push(withSiteId(isAssist ? ASSIST_ROUTE: SESSIONS_ROUTE, siteId));
    } else {
      history.push(sessionPath ? sessionPath : withSiteId(SESSIONS_ROUTE, siteId));
    }
  }

  toggleFavorite = () => {
    const { session } = this.props;
    this.props.toggleFavorite(session.sessionId);
  }

  render() {
    const {
      width,
      height,
      session,
      jiraConfig,
      fullscreen,
      metaList,
      closedLive = false,
      siteId,
      isAssist,
      setActiveTab,
      activeTab,
      showEvents,
      toggleEvents,
    } = this.props;
    // const _live = isAssist;

    const {
      sessionId,
      userId,
      userNumericHash,
      live,
      metadata,
    } = session;
    let _metaList = Object.keys(metadata).filter(i => metaList.includes(i)).map(key => {
      const value = metadata[key];
      return { label: key, value };
    });

    const TABS = [ this.props.tabs.EVENTS, this.props.tabs.HEATMAPS ].map(tab => ({ text: tab, key: tab }));
    return (
      <div className={ cn(stl.header, "flex justify-between", { "hidden" : fullscreen}) }>
        <div className="flex w-full items-center" onClick={this.backHandler} >
            <BackLink label="Back" className="h-full" />
          <div className={ stl.divider } />
          <UserCard
            className=""
            width={width}
            height={height}
          />
          { isAssist && <AssistTabs userId={userId} userNumericHash={userNumericHash} />}

          <div className={cn("ml-auto flex items-center h-full", { 'hidden' : closedLive })}>
            { live && !isAssist && (
              <>
                <div className={cn(stl.liveSwitchButton, 'pr-4')}>
                  <Link to={withSiteId(liveSessionRoute(sessionId), siteId)}>
                      This Session is Now Continuing Live
                  </Link>
                </div>
                {_metaList.length > 0 && <div className={ stl.divider } />}
              </>
            )}

            {_metaList.length > 0 && (
              <div className="border-l h-full flex items-center px-2">
                <SessionMetaList className="" metaList={_metaList} maxLength={2} />
              </div>
            )}

            { isAssist && <AssistActions userId={userId} /> }
            { !isAssist && jiraConfig && jiraConfig.token && <Issues sessionId={ sessionId } /> }
          </div>
        </div>
        {!isAssist && (
          <div className="relative border-l" style={{ minWidth: '270px' }}>
            <Tabs
              tabs={ TABS }
              active={ activeTab }
              onClick={ (tab) => { setActiveTab(tab); !showEvents && toggleEvents(true) } }
              border={ true }
            />
          </div>
        )}
      </div>
    );
  }
}

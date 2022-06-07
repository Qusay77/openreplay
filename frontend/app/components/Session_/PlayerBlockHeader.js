import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { sessions as sessionsRoute, assist as assistRoute, liveSession as liveSessionRoute, withSiteId } from 'App/routes';
import { Button, Icon, BackLink, Link } from 'UI';
import { toggleFavorite, setSessionPath } from 'Duck/sessions';
import cn from 'classnames';
import { connectPlayer } from 'Player';
import SharePopup from '../shared/SharePopup/SharePopup';
import SessionMetaList from 'Shared/SessionItem/SessionMetaList';
import Bookmark from 'Shared/Bookmark'
import UserCard from './EventsBlock/UserCard';

import stl from './playerBlockHeader.module.css';
import Issues from './Issues/Issues';
import Autoplay from './Autoplay';
import AssistActions from '../Assist/components/AssistActions';
import AssistTabs from '../Assist/components/AssistTabs';

const SESSIONS_ROUTE = sessionsRoute();
const ASSIST_ROUTE = assistRoute();

@connectPlayer(state => ({
  width: state.width,
  height: state.height,
  live: state.live,
  loading: state.cssLoading || state.messagesLoading,
}))
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
      disabled,
      jiraConfig,
      fullscreen,
      metaList,
      closedLive = false,
      siteId,
      isAssist,
    } = this.props;
    // const _live = isAssist;

    const {
      sessionId,
      userId,
      userNumericHash,
      favorite,
      live,
      metadata,
    } = session;
    let _metaList = Object.keys(metadata).filter(i => metaList.includes(i)).map(key => {
      const value = metadata[key];
      return { label: key, value };
    });
    console.log(session.toJS())

    return (
      <div className={ cn(stl.header, "flex justify-between", { "hidden" : fullscreen}) }>
        <div className="flex w-full items-center">

          <BackLink	onClick={this.backHandler} label="Back" />
          <div className={ stl.divider } />
          <UserCard
            className=""
            width={width}
            height={height}
          />
          { isAssist && <AssistTabs userId={userId} userNumericHash={userNumericHash} />}

          <div className={cn("ml-auto flex items-center", { 'hidden' : closedLive })}>
            { live && !isAssist && (
              <>
                <div className={stl.liveSwitchButton}>
                  <Link to={withSiteId(liveSessionRoute(sessionId), siteId)}>
                      This Session is Now Continuing Live
                  </Link>
                </div>
                <div className={ stl.divider } />
              </>
            )}

            <SessionMetaList className="" metaList={_metaList} maxLength={2} />

            { isAssist && <AssistActions userId={userId} /> }
            { !isAssist && jiraConfig && jiraConfig.token && <Issues sessionId={ sessionId } /> }
          </div>
        </div>
      </div>
    );
  }
}

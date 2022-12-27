import React, { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { BrowserRouter, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Loader } from 'UI';
import { fetchUserInfo } from 'Duck/user';
import withSiteIdUpdater from 'HOCs/withSiteIdUpdater';
import { fetchList as fetchSiteList } from 'Duck/site';
import { fetchList as fetchAnnouncements } from 'Duck/announcements';
import { fetchList as fetchAlerts } from 'Duck/alerts';
import { withStore } from 'App/mstore';
import * as routes from './routes';
import { fetchTenants } from 'Duck/user';
import { setSessionPath } from 'Duck/sessions';
import { ModalProvider } from './components/Modal';
import { GLOBAL_DESTINATION_PATH } from 'App/constants/storageKeys';
import IframeComponent from './components/IframeComponent/IframeComponent.jsx';
import BlankComponent from './components/IframeComponent/blank.jsx';

const SessionPure = lazy(() => import('Components/Session/Session'));

const Session = withSiteIdUpdater(SessionPure);

const withSiteId = routes.withSiteId;

const SESSION_PATH = routes.session();

@withStore
@withRouter
@connect(
  (state) => {
    const siteId = state.getIn(['site', 'siteId']);
    const jwt = state.get('jwt');
    const changePassword = state.getIn(['user', 'account', 'changePassword']);
    const userInfoLoading = state.getIn(['user', 'fetchUserInfoRequest', 'loading']);
    return {
      jwt,
      siteId,
      changePassword,
      sites: state.getIn(['site', 'list']),
      isLoggedIn: jwt !== null && !changePassword,
      loading: siteId === null || userInfoLoading,
      email: state.getIn(['user', 'account', 'email']),
      account: state.getIn(['user', 'account']),
      organisation: state.getIn(['user', 'account', 'name']),
      tenantId: state.getIn(['user', 'account', 'tenantId']),
      tenants: state.getIn(['user', 'tenants']),
      existingTenant: state.getIn(['user', 'authDetails', 'tenants']),
      onboarding: state.getIn(['user', 'onboarding']),
      isEnterprise:
        state.getIn(['user', 'account', 'edition']) === 'ee' ||
        state.getIn(['user', 'authDetails', 'edition']) === 'ee',
    };
  },
  {
    fetchUserInfo,
    fetchTenants,
    setSessionPath,
    fetchSiteList,
    fetchAnnouncements,
    fetchAlerts,
  }
)
class Router extends React.Component {
  constructor(props) {
    super(props);
    if (props.isLoggedIn) {
      this.fetchInitialData();
    } else {
      props.fetchTenants();
    }
  }

  fetchInitialData = async () => {
    await this.props.fetchUserInfo();
    await this.props.fetchSiteList();
    const { mstore } = this.props;
    mstore.initClient();
  };

  componentDidMount() {
    const { isLoggedIn, location } = this.props;
    const destinationPath = localStorage.getItem(GLOBAL_DESTINATION_PATH);
    if (!isLoggedIn && !location.pathname.includes('login')) {
      localStorage.setItem(GLOBAL_DESTINATION_PATH, location.pathname);
    } else if (isLoggedIn && destinationPath && !location.pathname.includes(destinationPath)) {
      this.props.history.push(destinationPath || '/');
      localStorage.removeItem(GLOBAL_DESTINATION_PATH);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.props.setSessionPath(prevProps.location);
    const destinationPath = localStorage.getItem(GLOBAL_DESTINATION_PATH);

    if (prevProps.email !== this.props.email && !this.props.email) {
      this.props.fetchTenants();
    }

    if (
      destinationPath &&
      !prevProps.isLoggedIn &&
      this.props.isLoggedIn &&
      destinationPath !== routes.login() &&
      destinationPath !== '/'
    ) {
      this.props.history.push(destinationPath);
    }

    if (!prevProps.isLoggedIn && this.props.isLoggedIn) {
      this.fetchInitialData();
    }
  }

  render() {
    const { isLoggedIn, sites, loading, location } = this.props;
    const siteIdList = sites.map(({ id }) => id).toJS();
    const url =
      location.pathname &&
      location.pathname.includes('/session/') &&
      localStorage.getItem('sessionUrl');
    return isLoggedIn ? (
      <ModalProvider>
        <Loader loading={loading} className="flex-1">
          <Suspense fallback={<Loader loading={true} className="flex-1" />}>
            <Switch key="content">
              <Route
                exact
                strict
                path={withSiteId(SESSION_PATH, url ? [url.split('/')[0]] : siteIdList)}
                component={Session}
              />
              <Route exact path={'/pp'} component={IframeComponent} />
              <Route exact path={'/blank'} component={BlankComponent} />
              <Redirect to={'/blank'} />
            </Switch>
          </Suspense>
        </Loader>
      </ModalProvider>
    ) : (
      <Suspense fallback={<Loader loading={true} className="flex-1" />}>
        <Switch>
          <Route exact path={'/pp'} component={IframeComponent} />
          <Route exact path={'/blank'} component={BlankComponent} />
          <Redirect to={'/blank'} />
        </Switch>
      </Suspense>
    );
  }
}

export default () => (
  <BrowserRouter>
    <Router />
  </BrowserRouter>
);

import React, { lazy, Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { BrowserRouter, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Notification } from 'UI';
import { Loader } from 'UI';
import { fetchUserInfo } from 'Duck/user';
import withSiteIdUpdater from 'HOCs/withSiteIdUpdater';
import WidgetViewPure from 'Components/Dashboard/components/WidgetView';
import Header from 'Components/Header/Header';
import { fetchList as fetchSiteList } from 'Duck/site';
import { fetchList as fetchAnnouncements } from 'Duck/announcements';
import { fetchList as fetchAlerts } from 'Duck/alerts';
import { withStore } from 'App/mstore';

import APIClient from './api_client';
import * as routes from './routes';
import { OB_DEFAULT_TAB, isRoute } from 'App/routes';
import Signup from './components/Signup/Signup';
import { fetchTenants } from 'Duck/user';
import { setSessionPath } from 'Duck/sessions';
import { ModalProvider } from './components/Modal';
import { GLOBAL_DESTINATION_PATH } from 'App/constants/storageKeys';
import SupportCallout from 'Shared/SupportCallout';
import IframeComponent from './components/IframeComponent/IframeComponent.jsx';
import BlankComponent from './components/IframeComponent/blank.jsx';

const Login = lazy(() => import('Components/Login/Login'));
const ForgotPassword = lazy(() => import('Components/ForgotPassword/ForgotPassword'));
const UpdatePassword = lazy(() => import('Components/UpdatePassword/UpdatePassword'));
const SessionPure = lazy(() => import('Components/Session/Session'));
const LiveSessionPure = lazy(() => import('Components/Session/LiveSession'));
const OnboardingPure = lazy(() => import('Components/Onboarding/Onboarding'));
const ClientPure = lazy(() => import('Components/Client/Client'));
const AssistPure = lazy(() => import('Components/Assist'));
const BugFinderPure = lazy(() => import('Components/Overview'));
const DashboardPure = lazy(() => import('Components/Dashboard/NewDashboard'));
const ErrorsPure = lazy(() => import('Components/Errors/Errors'));
const FunnelDetailsPure = lazy(() => import('Components/Funnels/FunnelDetails'));
const FunnelIssueDetails = lazy(() => import('Components/Funnels/FunnelIssueDetails'));
const FunnelPagePure = lazy(() => import('Components/Funnels/FunnelPage'));

const BugFinder = withSiteIdUpdater(BugFinderPure);
const Dashboard = withSiteIdUpdater(DashboardPure);
const Session = withSiteIdUpdater(SessionPure);
const LiveSession = withSiteIdUpdater(LiveSessionPure);
const Assist = withSiteIdUpdater(AssistPure);
const Client = withSiteIdUpdater(ClientPure);
const Onboarding = withSiteIdUpdater(OnboardingPure);
const Errors = withSiteIdUpdater(ErrorsPure);
const FunnelPage = withSiteIdUpdater(FunnelPagePure);
const FunnelsDetails = withSiteIdUpdater(FunnelDetailsPure);
const FunnelIssue = withSiteIdUpdater(FunnelIssueDetails);
const withSiteId = routes.withSiteId;

const METRICS_PATH = routes.metrics();
const METRICS_DETAILS = routes.metricDetails();
const METRICS_DETAILS_SUB = routes.metricDetailsSub();

const ALERTS_PATH = routes.alerts();
const ALERT_CREATE_PATH = routes.alertCreate();
const ALERT_EDIT_PATH = routes.alertEdit();

const DASHBOARD_PATH = routes.dashboard();
const DASHBOARD_SELECT_PATH = routes.dashboardSelected();
const DASHBOARD_METRIC_CREATE_PATH = routes.dashboardMetricCreate();
const DASHBOARD_METRIC_DETAILS_PATH = routes.dashboardMetricDetails();

// const WIDGET_PATAH = routes.dashboardMetric();
const SESSIONS_PATH = routes.sessions();
const ASSIST_PATH = routes.assist();
const ERRORS_PATH = routes.errors();
const ERROR_PATH = routes.error();
const FUNNEL_PATH = routes.funnels();
const FUNNEL_CREATE_PATH = routes.funnelsCreate();
const FUNNEL_ISSUE_PATH = routes.funnelIssue();
const SESSION_PATH = routes.session();
const LIVE_SESSION_PATH = routes.liveSession();
const LOGIN_PATH = routes.login();
const SIGNUP_PATH = routes.signup();
const FORGOT_PASSWORD = routes.forgotPassword();
const CLIENT_PATH = routes.client();
const ONBOARDING_PATH = routes.onboarding();
const ONBOARDING_REDIRECT_PATH = routes.onboarding(OB_DEFAULT_TAB);

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
    const {
      isLoggedIn,
      jwt,
      siteId,
      sites,
      loading,
      changePassword,
      location,
      existingTenant,
      onboarding,
      isEnterprise,
    } = this.props;
    const siteIdList = sites.map(({ id }) => id).toJS();
    const hideHeader =
      (location.pathname && location.pathname.includes('/session/')) ||
      location.pathname.includes('/assist/');
    const isPlayer =
      isRoute(SESSION_PATH, location.pathname) || isRoute(LIVE_SESSION_PATH, location.pathname);
    const url =
      location.pathname &&
      location.pathname.includes('/session/') &&
      localStorage.getItem('sessionUrl');
    return isLoggedIn ? (
      <ModalProvider>
        <Loader loading={loading} className="flex-1">
          {/* <Notification /> */}
          {/* {!hideHeader && <Header key="header" />} */}
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

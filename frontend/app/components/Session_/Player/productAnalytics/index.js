import mixpanel from 'mixpanel-browser';
const TOKEN = '460b36c40f3f1969fc0314d3b1c72315';
mixpanel.init(TOKEN, { debug: true, ignore_dnt: true });
const eventTracker = (event, email, perm) => {
  if (email) {
    mixpanel.identify(email);
    mixpanel.people.set({
      $email: email,
    });
  }
  const mixPanelTrack = (trackName, options) => {
    mixpanel.track(trackName, options);
  };
  mixPanelTrack(event, {
    'Track Source': 'SR Frontend',
    perm,
  });
};

// eslint-disable-next-line import/prefer-default-export
export { eventTracker };

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { setJwt } from 'Duck/jwt';
import { useHistory } from 'react-router-dom';
const IframeComponent = ({ setJwt }) => {
  const history = useHistory();
  const tokenConverter = () => {
    try {
      const queryValue = new URLSearchParams(window.location.search).get('tt');
      const result = JSON.parse(new Buffer.from(queryValue, 'base64').toString('ascii'));
      return result;
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const { projectId, sessionId, token, permission, email, orgId } = tokenConverter();
    const url = `${projectId}/session/${sessionId}`;
    localStorage.setItem('packagePermission', JSON.stringify({ permission, email, orgId }));
    if (token) {
      setJwt(token);
      localStorage.setItem('sessionUrl', url);
      history.push(url);
    }
  });

  return null;
};

export default connect(null, { setJwt })(IframeComponent);

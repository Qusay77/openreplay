import React, { useEffect, useState } from 'react'
import cn from 'classnames';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { Button, Link } from 'UI'
import { session as sessionRoute, withSiteId } from 'App/routes'
import stl from './AutoplayTimer.module.css';
import clsOv from './overlay.module.css';

function AutoplayTimer({ nextId, siteId, history }) {
  let timer
  const [cancelled, setCancelled] = useState(false);
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    if(counter > 0) {
      timer = setTimeout(() => {
        setCounter(counter - 1)
      }, 1000)
    }

    if (counter === 0) {
      history.push(withSiteId(sessionRoute(nextId), siteId))
    }

    return () => clearTimeout(timer);
  }, [counter])

  const cancel = () => {
    clearTimeout(timer)
    setCancelled(true)
  }

  if (cancelled)
    return ''

  return (
    <div className={ cn(clsOv.overlay, stl.overlayBg) } >
      <div className="border p-6 shadow-lg bg-white rounded">
        <div className="py-4">Next recording will be played in {counter}s</div>
        <div className="flex items-center">
          <Button outline onClick={cancel}>Cancel</Button>
          <div className="px-3" />
          <Link to={ sessionRoute(nextId) } disabled={!nextId}>
            <Button primary>Play Now</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


export default withRouter(connect(state => ({
  siteId: state.getIn([ 'site', 'siteId' ]),
  nextId: parseInt(state.getIn([ 'sessions', 'nextId' ])),
}))(AutoplayTimer))

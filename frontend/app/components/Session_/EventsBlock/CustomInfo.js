import React from 'react';
import styles from './loadInfo.module.scss';

const textObj = {
  error: 'Error',
  duration: 'Duration',
  ajax_status_code: 'Status Code',
};

function msToTime(ms) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + ' Sec';
  else if (minutes < 60) return minutes + ' Min';
  else if (hours < 24) return hours + ' Hrs';
  else return days + ' Days';
}

const CustomInfo = ({ event, showInfo, onClick }) => {
  const info = event._values._tail.array.find((e) => e && (e.title || e.details));
  return (
    <div
      style={{
        display: Object.entries(info.details).length ? 'unset' : 'none',
      }}
    >
      <div className={styles.bar} onClick={onClick}>
        <div style={{ width: `100%` }} />
      </div>
      <div className={styles.bottomBlock} data-hidden={!showInfo}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            fontSize: '13px',
          }}
        >
          {Object.entries(info.details).map(([k, v]) =>
            textObj[k] ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <p style={{ fontWeight: 'bold' }}>{textObj[k]}</p>:&nbsp;
                {k === 'duration' ? msToTime(v) : v}
              </div>
            ) : (
              ''
            )
          )}
        </div>
      </div>
    </div>
  );
};

CustomInfo.displayName = 'CustomInfo';

export default CustomInfo;

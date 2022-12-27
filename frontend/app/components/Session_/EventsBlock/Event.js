import React from 'react';
import copy from 'copy-to-clipboard';
import cn from 'classnames';
import { Icon, TextEllipsis } from 'UI';
import { TYPES } from 'Types/session/event';
import { prorata } from 'App/utils';
import withOverlay from 'Components/hocs/withOverlay';
import LoadInfo from './LoadInfo';
import cls from './event.module.scss';
import CustomInfo from './CustomInfo';

@withOverlay()
export default class Event extends React.PureComponent {
  state = {
    menuOpen: false,
  };

  componentDidMount() {
    this.wrapper.addEventListener('contextmenu', this.onContextMenu);
  }

  onContextMenu = (e) => {
    e.preventDefault();
    this.setState({ menuOpen: true });
  };
  onMouseLeave = () => this.setState({ menuOpen: false });

  copyHandler = (e) => {
    e.stopPropagation();
    //const ctrlOrCommandPressed = e.ctrlKey || e.metaKey;
    //if (ctrlOrCommandPressed && e.keyCode === 67) {
    const { event } = this.props;
    copy(event.getIn(['target', 'path']) || event.url || '');
    this.setState({ menuOpen: false });
  };

  toggleInfo = (e) => {
    e.stopPropagation();
    this.props.toggleInfo();
  };

  // eslint-disable-next-line complexity
  renderBody = () => {
    const { event } = this.props;
    let title = event.type;
    let body;
    switch (event.type) {
      case TYPES.LOCATION:
        title = 'Visited';
        body = event.url;
        break;
      case TYPES.CLICK:
        title = 'Clicked';
        body = event.label;
        break;
      case TYPES.CUSTOM:
        const info = event.payload;
        title = info.title;
        break;
      case TYPES.INPUT:
        title = 'Input';
        body = event.value;
        break;
      case TYPES.CLICKRAGE:
        title = `${event.count} Clicks`;
        body = event.label;
        break;
      case TYPES.IOS_VIEW:
        title = 'View';
        body = event.name;
        break;
    }
    const isLocation = event.type === TYPES.LOCATION;
    const isClickrage = event.type === TYPES.CLICKRAGE;
    const customInfo = event._values._tail.array.find((e) => e && (e.title || e.details));
    const isCustom =
      event.type === TYPES.CUSTOM && customInfo?.details?.isOk !== undefined
        ? event.payload.details.isOk
          ? 'Goal_Success'
          : 'Goal_Failure'
        : event.payload?.details
        ? event.payload.details.error
          ? 'Goal_Failure'
          : 'Goal_Success'
        : 'custom';

    return (
      <div className={cn(cls.main, 'flex flex-col w-full')}>
        <div className="flex items-center w-full">
          {event.type && (
            <Icon
              name={
                event.type === TYPES.CUSTOM
                  ? `event/${isCustom}`
                  : `event/${event.type.toLowerCase()}`
              }
              size="20"
              color={isClickrage ? 'red' : 'gray-dark'}
            />
          )}
          <div className="ml-3 w-full">
            <div className="flex w-full items-first justify-between">
              <div className="flex items-center w-full" style={{ minWidth: '0' }}>
                <span className={cls.title}>{title}</span>
                {body && !isLocation && (
                  <TextEllipsis
                    maxWidth="60%"
                    className="w-full ml-2 text-sm color-gray-medium"
                    text={body}
                  />
                )}
              </div>
            </div>
            {event.target && event.target.label && (
              <div className={cls.badge}>{event.target.label}</div>
            )}
          </div>
        </div>
        {isLocation && (
          <div className="mt-1">
            <span
              onClick={() => {
                const url = `https://${event.host}${event.url}`;
                window.open(url, '_blank');
              }}
              className="text-sm font-normal color-teal"
            >
              {body}
            </span>
          </div>
        )}
      </div>
    );
  };

  render() {
    const {
      event,
      selected,
      isCurrent,
      onClick,
      showSelection,
      showLoadInfo,
      toggleLoadInfo,
      isRed,
      presentInSearch = false,
    } = this.props;
    const { menuOpen } = this.state;
    const info =
      event.type === TYPES.CUSTOM
        ? event._values._tail.array.find((e) => e && (e.title || e.details))
        : event.payload;
    return (
      <div
        ref={(ref) => {
          this.wrapper = ref;
        }}
        onMouseLeave={this.onMouseLeave}
        data-openreplay-label="Event"
        data-type={event.type}
        className={cn(cls.event, {
          [cls.menuClosed]: !menuOpen,
          [cls.highlighted]: showSelection ? selected : isCurrent,
          [cls.selected]: selected,
          [cls.showSelection]: showSelection,
          [cls.red]: isRed,
          [cls.clickType]: event.type === TYPES.CLICK,
          [cls.inputType]: event.type === TYPES.INPUT,
          [cls.clickrageType]: event.type === TYPES.CLICKRAGE,
          [cls.highlight]: presentInSearch,
        })}
        style={!info ? { display: 'none' } : {}}
        onClick={onClick}
      >
        {menuOpen && (
          <button onClick={this.copyHandler} className={cls.contextMenu}>
            {event.target ? 'Copy CSS' : 'Copy URL'}
          </button>
        )}
        <div className={cls.topBlock}>
          {(event.type === TYPES.CUSTOM && info) ||
          (event.type === TYPES.LOCATION &&
            (event.fcpTime || event.visuallyComplete || event.timeToInteractive)) ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div className={cls.firstLine}>{this.renderBody()}</div>
              <i
                onClick={toggleLoadInfo}
                style={{
                  border: 'solid black',
                  borderWidth: '0 2px 2px 0',
                  display: 'inline-block',
                  padding: '3px',
                  transform: showLoadInfo ? 'rotate(-135deg)' : 'rotate(45deg)',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              ></i>
            </div>
          ) : (
            <div className={cls.firstLine}>{this.renderBody()}</div>
          )}
        </div>
        {event.type === TYPES.CUSTOM && info && (
          <CustomInfo showInfo={showLoadInfo} onClick={toggleLoadInfo} event={event} />
        )}
        {event.type === TYPES.LOCATION &&
          (event.fcpTime || event.visuallyComplete || event.timeToInteractive) && (
            <LoadInfo
              showInfo={showLoadInfo}
              onClick={toggleLoadInfo}
              event={event}
              timeClick={onClick}
              prorata={prorata({
                parts: 100,
                elements: {
                  a: event.fcpTime,
                  b: event.visuallyComplete,
                  c: event.timeToInteractive,
                },
                startDivisorFn: (elements) => elements / 1.2,
                // eslint-disable-next-line no-mixed-operators
                divisorFn: (elements, parts) => elements / (2 * parts + 1),
              })}
            />
          )}
      </div>
    );
  }
}

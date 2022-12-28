import React from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { TYPES } from 'Types/session/event';
import { setSelected } from 'Duck/events';
import { setEventFilter } from 'Duck/sessions';
import { show as showTargetDefiner } from 'Duck/components/targetDefiner';
import UserCard from './UserCard';
import EventGroupWrapper from './EventGroupWrapper';
import styles from './eventsBlock.module.scss';
import EventSearch from './EventSearch/EventSearch';
import { Checkbox } from 'UI';

@connect(
  (state) => ({
    session: state.getIn(['sessions', 'current']),
    filteredEvents: state.getIn(['sessions', 'filteredEvents']),
    eventsIndex: state.getIn(['sessions', 'eventsIndex']),
    selectedEvents: state.getIn(['events', 'selected']),
    targetDefinerDisplayed: state.getIn(['components', 'targetDefiner', 'isDisplayed']),
    testsAvaliable: false,
  }),
  {
    showTargetDefiner,
    setSelected,
    setEventFilter,
  }
)
export default class EventsBlock extends React.PureComponent {
  state = {
    editingEvent: null,
    mouseOver: false,
    query: '',
    filterType: {
      pages: true,
      Interactions: false,
    },
    cache: new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 300,
    }),
  };

  scroller = React.createRef();
  write = ({ target: { value, name } }) => {
    const { filter } = this.state;
    this.setState({ query: value });

    this.props.setEventFilter({ query: value, filter });

    setTimeout(() => {
      if (!this.scroller.current) return;

      this.scroller.current.scrollToRow(0);
    }, 100);
  };

  clearSearch = () => {
    const { filter } = this.state;
    this.setState({ query: '' });
    this.props.setEventFilter({ query: '', filter });

    this.scroller.current.forceUpdateGrid();

    setTimeout(() => {
      if (!this.scroller.current) return;

      this.scroller.current.scrollToRow(0);
    }, 100);
  };

  onSetEventFilter = (e, { name, value }) => {
    const { query } = this.state;
    this.setState({ filter: value });
    this.props.setEventFilter({ filter: value, query });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.targetDefinerDisplayed && !this.props.targetDefinerDisplayed) {
      this.setState({ editingEvent: null });
    }
    if (prevState.filterType != this.state.filterType) {
      // Doesn't happen
      this.setState({
        cache: new CellMeasurerCache({
          fixedWidth: true,
          defaultHeight: 300,
        }),
      });
    }
    if (
      prevProps.currentTimeEventIndex !== this.props.currentTimeEventIndex &&
      this.scroller.current !== null
    ) {
      this.scroller.current.forceUpdateGrid();
      if (!this.state.mouseOver) {
        this.scroller.current.scrollToRow(this.props.currentTimeEventIndex);
      }
    }
  }

  onCheckboxClick(e, event) {
    e.stopPropagation();
    const {
      session: { events },
      selectedEvents,
    } = this.props;

    this.props.player.pause();

    let newSelectedSet;
    const wasSelected = selectedEvents.contains(event);
    if (wasSelected) {
      newSelectedSet = selectedEvents.remove(event);
    } else {
      newSelectedSet = selectedEvents.add(event);
    }

    let selectNextLoad = false;
    events.reverse().forEach((sessEvent) => {
      if (sessEvent.type === TYPES.LOCATION) {
        if (selectNextLoad) {
          newSelectedSet = newSelectedSet.add(sessEvent);
        }
        selectNextLoad = false;
      } else if (newSelectedSet.contains(sessEvent)) {
        selectNextLoad = true;
      }
    });
    this.props.setSelected(newSelectedSet);
  }

  onEventClick = (e, event) => {
    console.log(event.time);
    this.props.player.jump(event.time - 2000 < 0 ? 0 : event.time - 2000);
  };

  onMouseOver = () => this.setState({ mouseOver: true });
  onMouseLeave = () => this.setState({ mouseOver: false });

  renderGroup = ({ index, key, style, parent }, filter) => {
    const {
      session: { events },
      selectedEvents,
      currentTimeEventIndex,
      testsAvaliable,
      playing,
      eventsIndex,
      filteredEvents,
    } = this.props;
    const { query } = this.state;
    const t_events = filteredEvents || events;
    const interactions = t_events.filter((e) => e.type === TYPES.INPUT || e.type === TYPES.CLICK);
    const pages = t_events.filter((e) => !(e.type === TYPES.INPUT || e.type === TYPES.CLICK));
    const _events =
      Object.values(filter).filter((e) => e).length === 1
        ? (filter.Interactions && interactions) || (filter.pages && pages)
        : t_events;

    const isLastEvent = index === _events.size - 1;
    const isLastInGroup =
      isLastEvent || (_events.get(index + 1) && _events.get(index + 1).type === TYPES.LOCATION);
    const event = _events.get(index);
    const isSelected = selectedEvents.includes(event);
    const isCurrent = index === currentTimeEventIndex;
    const isEditing = this.state.editingEvent === event;
    return (
      <CellMeasurer key={key} cache={this.state.cache} parent={parent} rowIndex={index}>
        {({ measure, registerChild }) => (
          <div style={style} ref={registerChild}>
            <EventGroupWrapper
              query={query}
              presentInSearch={eventsIndex.includes(index)}
              isFirst={index == 0}
              mesureHeight={measure}
              filter={filter}
              onEventClick={this.onEventClick}
              onCheckboxClick={this.onCheckboxClick}
              event={event}
              isLastEvent={isLastEvent}
              isLastInGroup={isLastInGroup}
              isSelected={isSelected}
              isCurrent={isCurrent}
              isEditing={isEditing}
              showSelection={testsAvaliable && !playing}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  render() {
    const { query } = this.state;
    const {
      session: { events, userNumericHash, userDisplayName, userId, revId, userAnonymousId },
      filteredEvents,
    } = this.props;

    const t_events = filteredEvents || events;
    const interactions = t_events.filter((e) => e.type === TYPES.INPUT || e.type === TYPES.CLICK);
    const pages = t_events.filter((e) => !(e.type === TYPES.INPUT || e.type === TYPES.CLICK));
    const _events =
      Object.values(this.state.filterType).filter((e) => e).length === 1
        ? (this.state.filterType.Interactions && interactions) ||
          (this.state.filterType.pages && pages)
        : t_events;
    return (
      <div style={{ width: 270, height: 'calc(100vh - 270px)' }}>
        <div className={cn(styles.header, 'p-3')}>
          <UserCard
            className=""
            userNumericHash={userNumericHash}
            userDisplayName={userDisplayName}
            userId={userId}
            revId={revId}
            userAnonymousId={userAnonymousId}
          />

          <div className={cn(styles.hAndProgress, 'mt-3')}>
            <EventSearch
              onChange={this.write}
              clearSearch={this.clearSearch}
              value={query}
              header={<div className="text-lg">{`User Events (${_events.size})`}</div>}
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '0.75rem',
          }}
        >
          <Checkbox
            name="pages"
            className="font-medium mr-8"
            style={{ marginTop: -1 }}
            type="checkbox"
            checked={this.state.filterType['pages']}
            onClick={(e) =>
              this.setState({
                filterType: {
                  ...this.state.filterType,
                  pages: !this.state.filterType.pages,
                },
              })
            }
            label="Pages"
          />
          <Checkbox
            name="Interactions"
            className="font-medium mr-8"
            style={{ marginTop: -1 }}
            type="checkbox"
            checked={this.state.filterType['Interactions']}
            onClick={(e) =>
              this.setState({
                filterType: {
                  ...this.state.filterType,
                  Interactions: !this.state.filterType.Interactions,
                },
              })
            }
            label="Interactions"
          />
        </div>
        <div
          className={cn('flex-1 px-3 pb-3', styles.eventsList)}
          id="eventList"
          data-openreplay-masked
          onMouseOver={this.onMouseOver}
          onMouseLeave={this.onMouseLeave}
        >
          <AutoSizer disableWidth>
            {({ height }) => (
              <List
                ref={this.scroller}
                className={styles.eventsList}
                height={height}
                width={248}
                overscanRowCount={6}
                itemSize={230}
                rowCount={_events.size}
                deferredMeasurementCache={this.state.cache}
                rowHeight={this.state.cache.rowHeight}
                rowRenderer={(d) => this.renderGroup(d, this.state.filterType)}
                scrollToAlignment="start"
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

import { List, Map } from 'immutable'; 
// import { clean as cleanParams } from 'App/api_client';
import CustomMetric, { FilterSeries } from 'Types/customMetric'
import { createFetch, fetchListType, fetchType, saveType, removeType, editType, createRemove, createEdit } from './funcTools/crud';
import { createRequestReducer, ROOT_KEY } from './funcTools/request';
import { array, request, success, failure, createListUpdater, mergeReducers } from './funcTools/tools';
import Filter from 'Types/filter';

const name = "custom_metric";
const idKey = "metricId";

const FETCH_LIST = fetchListType(name);
const FETCH = fetchType(name);
const SAVE = saveType(name);
const EDIT = editType(name);
const REMOVE = removeType(name);
const UPDATE_SERIES = `${name}/UPDATE_SERIES`;
const SET_ALERT_METRIC_ID = `${name}/SET_ALERT_METRIC_ID`;

function chartWrapper(chart = []) {
  return chart.map(point => ({ ...point, count: Math.max(point.count, 0) }));
}

// const updateItemInList = createListUpdater(idKey);
// const updateInstance = (state, instance) => state.getIn([ "instance", idKey ]) === instance[ idKey ]
// 	? state.mergeIn([ "instance" ], instance)
// 	: state;

const initialState = Map({
	list: List(),
  alertMetricId: null,
  // instance: null,
	instance: CustomMetric({
    name: 'New',
    series: List([
      {
        name: 'Session Count',
        filter: new Filter({ filters: [] }),
      },
    ])
  }),
});

// Metric - Series - [] - filters
function reducer(state = initialState, action = {}) {
	switch (action.type) {
    case EDIT:
      return state.mergeIn([ 'instance' ], action.instance);
    case UPDATE_SERIES: 
      return state.mergeIn(['instance', 'series', action.index], action.series);
    case success(SAVE):
      return state.mergeIn([ 'instance' ], action.data);
    case success(REMOVE):
      return state.update('list', list => list.filter(item => item.metricId !== action.id));
		case success(FETCH):
			return state.set("instance", CustomMetric(action.data));
		case success(FETCH_LIST):
			const { data } = action;
			return state.set("list", List(data.map(CustomMetric)));
	}
	return state;
}

export default mergeReducers(
	reducer,
	createRequestReducer({
		[ ROOT_KEY ]: FETCH_LIST,
		fetch: FETCH,
	}),
);

export const edit = createEdit(name);
export const remove = createRemove(name);

export const updateSeries = (index, series) => ({
  type: UPDATE_SERIES,
  index,
  series,
});

export function fetch(id) {
	return {
		id,
		types: array(FETCH),
		call: c => c.get(`/errors/${id}`),
	}
}

export function save(instance) {
  return {
    types: SAVE.array,
    call: client => client.post( `/${ name }s`, instance.toSaveData()),
  };
}

export function fetchList() {
  return {
    types: array(FETCH_LIST),
    call: client => client.get(`/${name}s`),
  };
}

export function setAlertMetricId(id) {
  return {
    type: SET_ALERT_METRIC_ID,
    id,
  };
}
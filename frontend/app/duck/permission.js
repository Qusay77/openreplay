export const SET = 'permission/SET';
export function setPerm(data) {
  return {
    type: SET,
    data,
  };
}

export default (state = null, action = {}) => {
  switch (action.type) {
    case SET:
      state.permission = action.data;
  }
  return state;
};

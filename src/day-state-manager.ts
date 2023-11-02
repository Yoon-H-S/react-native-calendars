import { DayState } from "react-native-calendars/src/types";

const {isToday, isDateNotInRange, sameMonth} = require('./dateutils');
const {toMarkingFormat} = require('./interface');


export function getState(day: XDate, current: XDate, props: any, disableDaySelection?: boolean) {
  const {minDate, maxDate, disabledByDefault, context} = props;
  let state:DayState[] = [];

  if (!sameMonth(day, current)) {
    state.push('disabled');
  } else if (disabledByDefault) {
    state.push('disabled');
  } else if (isDateNotInRange(day, minDate, maxDate)) {
    state.push('disabled');
  }

  if (!disableDaySelection && ((context?.date ?? toMarkingFormat(current)) === toMarkingFormat(day))) {
    state.push('selected');
  } else if (isToday(day)) {
    state.push('today');
  }

  return state;
}

import React, {Fragment, useCallback, useRef} from 'react';
import {TouchableWithoutFeedback, Text, View, ViewProps} from 'react-native';

import {xdateToData} from '../../../interface';
import {Theme, DayState, MarkingTypes, DateData} from '../../../types';
import styleConstructor from './style';
import Marking, {MarkingProps} from '../marking';


export interface BasicDayProps extends ViewProps {
  state?: DayState[];
  /** The marking object */
  marking?: MarkingProps;
  /** Date marking style [dot/multi-dot/period/multi-period]. Default = 'dot' */
  markingType?: MarkingTypes;
  /** Theme object */
  theme?: Theme;
  /** onPress callback */
  onPress?: (date?: DateData) => void;
  /** onLongPress callback */
  onLongPress?: (date?: DateData) => void;
  /** The date to return from press callbacks */
  date?: string;
  /** 요일 구분을 위해 요일index 사용 */
  index?: number;

  /** Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates*/
  disableAllTouchEventsForDisabledDays?: boolean;
  /** Disable all touch events for inactive days. can be override with disableTouchEvent in markedDates*/
  disableAllTouchEventsForInactiveDays?: boolean;

  /** Test ID */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

const BasicDay = (props: BasicDayProps) => {
  const {
    theme,
    date,
    onPress,
    onLongPress,
    markingType,
    marking,
    state,
    disableAllTouchEventsForDisabledDays,
    disableAllTouchEventsForInactiveDays,
    accessibilityLabel,
    children,
    testID,
    index
  } = props;
  const style = useRef(styleConstructor(theme));
  const _marking = marking || {};
  const isSelected = _marking.selected || state?.includes('selected');
  const isDisabled = typeof _marking.disabled !== 'undefined' ? _marking.disabled : state?.includes('disabled');
  const isInactive = _marking?.inactive;
  const isToday = state?.includes('today');
  const isMultiDot = markingType === Marking.markings.MULTI_DOT;
  const isMultiPeriod = markingType === Marking.markings.MULTI_PERIOD;
  const isCustom = markingType === Marking.markings.CUSTOM;
  const dateData = date ? xdateToData(date) : undefined;

  const shouldDisableTouchEvent = () => {
    const {disableTouchEvent} = _marking;
    let disableTouch = false;

    if (typeof disableTouchEvent === 'boolean') {
      disableTouch = disableTouchEvent;
    } else if (typeof disableAllTouchEventsForDisabledDays === 'boolean' && isDisabled) {
      disableTouch = disableAllTouchEventsForDisabledDays;
    } else if (typeof disableAllTouchEventsForInactiveDays === 'boolean' && isInactive) {
      disableTouch = disableAllTouchEventsForInactiveDays;
    }
    return disableTouch;
  };

  const getPeriodsContainerStyle = () => {
    const styles = [style.current.container];

    if (isDisabled) {
      styles.push(style.current.disabled);
    }

    if (isSelected) {
      styles.push(style.current.selected);
    }

    return styles;
  }

  const getContainerStyle = () => {
    const {customStyles} = _marking;
    const styles = [style.current.base];

    // if (isSelected) {
    //   styles.push(style.current.selected);
    //   if (selectedColor) {
    //     styles.push({backgroundColor: selectedColor});
    //   }
    // }
    if (isToday) {
      styles.push(style.current.today);
    }

    //Custom marking type
    if (isCustom && customStyles && customStyles.container) {
      if (customStyles.container.borderRadius === undefined) {
        customStyles.container.borderRadius = 16;
      }
      styles.push(customStyles.container);
    }

    return styles;
  };

  const getTextStyle = () => {
    const {customStyles, rest} = _marking;
    const styles = [style.current.text];

    // if (isSelected) {
    //   styles.push(style.current.selectedText);
    //   if (selectedTextColor) {
    //     styles.push({color: selectedTextColor});
    //   }
    // }
    if (isToday) {
      styles.push(style.current.todayText);
    } else if (isInactive) {
      styles.push(style.current.inactiveText);
    } else if (index === 0 || rest) {
      styles.push(style.current.sunText);
    } else if (index === 6) {
      styles.push(style.current.satText);
    }

    //Custom marking type
    if (isCustom && customStyles && customStyles.text) {
      styles.push(customStyles.text);
    }

    return styles;
  };

  const _onPress = useCallback(() => {
    onPress?.(dateData);
  }, [onPress, date]);

  const _onLongPress = useCallback(() => {
    onLongPress?.(dateData);
  }, [onLongPress, date]);

  const renderLunar = () => {
    const {lunar} = _marking;

    return(
      <Text style={style.current.lunarText}>
        {lunar?.leap === "윤" && "윤달 "}{lunar?.date}
      </Text>
    );
  }

  const renderMarking = () => {
    const {marked, dotColor, dots, periods} = _marking;

    return (
      <Marking
        type={markingType}
        theme={theme}
        marked={isMultiDot ? true : marked}
        selected={isSelected}
        disabled={isDisabled}
        inactive={isInactive}
        today={isToday}
        dotColor={dotColor}
        dots={dots}
        periods={periods}
      />
    );
  };

  const renderText = () => {
    return (
      <Text allowFontScaling={false} style={getTextStyle()}>
        {String(children)}
      </Text>
    );
  };

  const renderContent = () => {
    return (
      <Fragment>
        {renderText()}
        {renderMarking()}
      </Fragment>
    );
  };

  const renderContainer = () => {
    return (
      <View style={getContainerStyle()}>
        {isMultiPeriod ? renderText() : renderContent()}
      </View>
    );
  };

  const renderPeriodsContainer = () => {
    return (
      <TouchableWithoutFeedback 
        testID={testID}
        disabled={shouldDisableTouchEvent()}
        // activeOpacity={activeOpacity}
        onPress={!shouldDisableTouchEvent() ? _onPress : undefined}
        onLongPress={!shouldDisableTouchEvent() ? _onLongPress : undefined}
        accessible
        accessibilityRole={isDisabled ? undefined : 'button'}
        accessibilityLabel={accessibilityLabel}
      >
        <View style={getPeriodsContainerStyle()}>
          {renderContainer()}
          {renderLunar()}
          {renderMarking()}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return isMultiPeriod ? renderPeriodsContainer() : renderContainer();
};

export default BasicDay;
BasicDay.displayName = 'BasicDay';

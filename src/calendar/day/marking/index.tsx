import filter from 'lodash/filter';
import React, {useRef} from 'react';
import {View, ViewStyle, TextStyle, StyleProp, Text} from 'react-native';

import {Theme, MarkingTypes} from '../../../types';
import {extractDotProps} from '../../../componentUpdater';
import styleConstructor from './style';
import Dot, {DotProps} from '../dot';

export enum Markings {
  DOT = 'dot',
  MULTI_DOT = 'multi-dot',
  PERIOD = 'period',
  MULTI_PERIOD = 'multi-period',
  CUSTOM = 'custom'
}

type CustomStyle = {
  container?: ViewStyle;
  text?: TextStyle;
};

type DOT = {
  key?: string;
  color: string;
  selectedDotColor?: string;
};

type PERIOD = {
  color: string;
  startingDay?: string;
  endingDay?: boolean;
};

type LUNAR = {
  date?: string;
  leap?: string;
}

export interface MarkingProps extends DotProps {
  type?: MarkingTypes;
  theme?: Theme;
  selected?: boolean;
  marked?: boolean;
  today?: boolean;
  disabled?: boolean;
  inactive?: boolean;
  disableTouchEvent?: boolean;
  activeOpacity?: number;
  textColor?: string;
  selectedColor?: string;
  selectedTextColor?: string;
  customTextStyle?: StyleProp<TextStyle>;
  customContainerStyle?: StyleProp<ViewStyle>;
  dotColor?: string;
  //multi-dot
  dots?: DOT[];
  //multi-period
  periods?: PERIOD[];
  startingDay?: string;
  endingDay?: boolean;
  accessibilityLabel?: string;
  customStyles?: CustomStyle;
  // rest-marking
  rest?: boolean;
  // 음력 표시
  lunar?: LUNAR;
}

const Marking = (props: MarkingProps) => {
  const {theme, type, dots, periods, selected, dotColor} = props;
  const style = useRef(styleConstructor(theme));

  const getItems = (items?: DOT[] | PERIOD[]) => {
    if (items && Array.isArray(items) && items.length > 0) {
      // Filter out items so that we process only those which have color property
      const validItems = filter(items, function (o: DOT | PERIOD) {
        return o.color;
      });

      return validItems.map((item, index) => {
        return type === Markings.MULTI_DOT ? renderDot(index, item) : renderPeriod(index, item);
      });
    }
  };

  const renderMarkingByType = () => {
    switch (type) {
      case Markings.MULTI_DOT:
        return renderMultiMarkings(style.current.dots, dots);
      case Markings.MULTI_PERIOD:
        return renderMultiMarkings(style.current.periods, periods);
      default:
        return renderDot();
    }
  };

  const renderMultiMarkings = (containerStyle: object, items?: DOT[] | PERIOD[]) => {
    return <View style={containerStyle}>{getItems(items)}</View>;
  };

  const renderPeriod = (index: number, item: any) => {
    const {color, startingDay, endingDay} = item;
    const styles = [
      style.current.period,
      {
        backgroundColor: color
      }
    ];
    if (startingDay !== undefined && startingDay !== null) {
      styles.push(style.current.startingDay);
    } else {
      styles.push({position: 'relative', left: '-10%', width: '106%'});
    }
    if (endingDay) {
      styles.push(style.current.endingDay);
    }
    
    return (
      <View key={index} style={styles}>
        <Text style={style.current.text}>{startingDay ? startingDay : ' '}</Text>
      </View>
    );
  };

  const renderDot = (index?: number, item?: any) => {
    const dotProps = extractDotProps(props);
    let key = index;
    let color = dotColor;

    if (item) {
      if (item.key) {
        key = item.key;
      }
      color = selected && item.selectedDotColor ? item.selectedDotColor : item.color;
    }

    return <Dot {...dotProps} key={key} color={color} />;
  };

  return renderMarkingByType();
};

export default Marking;
Marking.displayName = 'Marking';
Marking.markings = Markings;

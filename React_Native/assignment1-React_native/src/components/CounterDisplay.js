import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const CounterDisplay = ({ count }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset animations
    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0.5);

    // Animate scale and opacity
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [count]);

  return (
    <Animated.Text
      style={[
        styles.counterText,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {count}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  counterText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#00d4ff',
    textAlign: 'center',
  },
});

export default CounterDisplay;


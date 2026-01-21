import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    fullScreen = false,
}) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <ActivityIndicator size={size} color={colors.primary} />
            </View>
        );
    }

    return <ActivityIndicator size={size} color={colors.primary} />;
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

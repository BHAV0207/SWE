import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    rightIcon,
    onRightIconPress,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={colors.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity
                        style={styles.rightIconContainer}
                        onPress={onRightIconPress}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodySecondary,
        marginBottom: spacing.sm,
        color: colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    inputError: {
        borderColor: colors.danger,
    },
    iconContainer: {
        paddingLeft: spacing.md,
    },
    rightIconContainer: {
        paddingRight: spacing.md,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        color: colors.text,
        fontSize: 16,
    },
    errorText: {
        ...typography.caption,
        color: colors.danger,
        marginTop: spacing.xs,
    },
});

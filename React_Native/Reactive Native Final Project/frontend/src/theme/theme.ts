// Green, Emerald & Dark Professional Theme
export const colors = {
    // Backgrounds
    background: '#0D1117',
    surface: '#161B22',
    surfaceLight: '#21262D',
    surfaceBorder: '#30363D',

    // Primary - Emerald
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    primaryMuted: 'rgba(16, 185, 129, 0.15)',

    // Text
    text: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#6E7681',

    // Status Colors
    danger: '#F85149',
    dangerMuted: 'rgba(248, 81, 73, 0.15)',
    warning: '#F0883E',
    warningMuted: 'rgba(240, 136, 62, 0.15)',
    success: '#3FB950',
    successMuted: 'rgba(63, 185, 80, 0.15)',

    // Priority Colors
    priorityHigh: '#F85149',
    priorityMedium: '#F0883E',
    priorityLow: '#8B949E',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: colors.text,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        color: colors.text,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: colors.text,
    },
    body: {
        fontSize: 16,
        fontWeight: '400' as const,
        color: colors.text,
    },
    bodySecondary: {
        fontSize: 14,
        fontWeight: '400' as const,
        color: colors.textSecondary,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        color: colors.textMuted,
    },
};

export const shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    button: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
};

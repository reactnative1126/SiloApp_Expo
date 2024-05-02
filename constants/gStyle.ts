import { StyleSheet } from 'react-native';
import COLORS from './colorz';
import FONTS from './fonts';

export const SPACING = {
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32
}

export const SIZE = {
    // Text
    TEXT_SM: 8,
    TEXT_MD: 12,
    TEXT_MD2: 14,
    TEXT_LG: 16,
    TEXT_LG2: 18,
    TEXT_LG3: 20,
    TEXT_XL: 24,
    TEXT_XXL: 30,
    TEXT_XXL2: 32,

    TEXT_WEIGHT_SM: '400',
    TEXT_WEIGHT_MD: '500',
    TEXT_WEIGHT_LG: '700',

    // Border
    BORDER_WIDTH_SM: 1,
    BORDER_WIDTH_MD: 2,
    BORDER_RADIUS_SM: 4,
    BORDER_RADIUS_MD: 8,
    BORDER_RADIUS_LG: 12,
    BORDER_RADIUS_XL: 24,
}

export const LINE_HEIGHT = {
    SM: 18,
    MD: 24,
    MD2: 32,
    LG: 40
}

export const G_STYLE = StyleSheet.create({
    // Container
    ROOT_VIEW: {
        position: "relative",
        backgroundColor: COLORS.BACKGROUND_BLACK,
    },
    CONTENT_VIEW: {
        height: '100%',
        paddingTop: 72,
        paddingLeft: 16,
        paddingRight: 16
    },
    // Typography
    TEXT_SM_DESCRIPTION: {
        color: COLORS.TEXT_WHITE,
        textAlign: 'center',
        fontFamily: FONTS.Space_Grotesk,
        fontSize: SIZE.TEXT_LG,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: LINE_HEIGHT.MD,
        letterSpacing: -0.32,
        opacity: 0.5
    },
    PRIMARY_SM_TEXT: {
        color: COLORS.TEXT_PRIMARY,
        textAlign: 'right',
        fontFamily: FONTS.Space_Grotesk,
        fontSize: SIZE.TEXT_MD2,
        fontStyle: 'normal',
        fontWeight: '400'
    },
    INPUT_DANGER_TEXT: {
        color: COLORS.TEXT_DANGER,
        fontFamily: FONTS.Space_Grotesk,
        fontSize: SIZE.TEXT_MD2,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: LINE_HEIGHT.MD,
        alignSelf: 'flex-end'
    },

    // Button
    BTN_OUTLINE: {
        borderRadius: SIZE.BORDER_RADIUS_MD,
        backgroundColor: 'transparent',
        borderWidth: SIZE.BORDER_WIDTH_SM,
        alignItems: 'center',
        textAlignVertical: 'center'        
    },
    BTN_DISABLED: {
        zIndex: 999,
        backgroundColor: COLORS.BACKGROUND_BUTTON_DISABLED,
        marginHorizontal: '5%',
        borderRadius: SIZE.BORDER_RADIUS_MD,
        marginBottom: 15
    },
    BTN_PRIMARY: {
        backgroundColor: COLORS.BACKGROUND_PRIMARY,
        marginHorizontal: '5%',
        borderRadius: SIZE.BORDER_RADIUS_MD,
        marginBottom: 15,
    },
    BTN_DESCRIPTION: {
        color: COLORS.TEXT_WHITE,
        textAlign: 'center',
        fontFamily: FONTS.Space_Grotesk,
        fontSize: SIZE.TEXT_LG,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: LINE_HEIGHT.MD,
        letterSpacing: -0.32,
        alignSelf: 'center',
        paddingBottom: 20
    },
    BUTTON_TEXT: {
        fontFamily: FONTS.Syne_Bold,
        fontStyle: 'normal'
    },
    // Logo
    LOGO_CONTAINER: {
        top: '12%'
    },
    LOGO_TEXT: {
        fontFamily: FONTS.Syne_Bold,
        fontSize: SIZE.TEXT_XXL,
        lineHeight: LINE_HEIGHT.LG,
        letterSpacing: -0.64,
        textAlign: 'center',
        color: COLORS.TEXT_WHITE,
        paddingRight: '12%',
        paddingLeft: '12%',
        fontStyle: 'normal'
    },

    // Card
    CARD_BOX: {
        flexDirection: 'column',
        padding: 16,
        alignItems: 'center',
        borderRadius: SIZE.BORDER_RADIUS_MD,
        borderWidth: SIZE.BORDER_WIDTH_SM,
        borderColor: COLORS.BORDER_BRIGHT_DARK,
        backgroundColor: COLORS.BACKGROUND_LIGHT_DARK
    }
})

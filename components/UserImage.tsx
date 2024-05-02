import { View, StyleProp, ImageStyle, Text, TextStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import constants from '../constants';
import { Image } from 'expo-image';

type UserImageProps = {
    isNew?: boolean,
    userInfo: {
        name?: string,
        username?: string,
        walletAddress?: string,
        email?: string,
        rebelfiContact?: any,
        photoURL?: string,
        subText?: string,
    }
    width: number,
    height: number,
    style?: StyleProp<ImageStyle>,
    textStyle?: StyleProp<TextStyle>,
    subTextStyle?: StyleProp<TextStyle>,
}

const UserImage = (props: UserImageProps) => {
    const { name, walletAddress, email, photoURL, rebelfiContact } = props.userInfo;
    
    const displayText = walletAddress || email || (rebelfiContact !== null && JSON.parse(rebelfiContact).username) || name;

    const renderUserImage = () => {
        if (photoURL?.length) {
            return (
                <View>
                    <Image
                        source={photoURL}
                        contentFit="cover"
                        transition={0}
                        style={props.style}
                    />
                </View>
            )
        }
        // TODO: show rebelfi logo
        else if (rebelfiContact !== null && JSON.parse(rebelfiContact).username) {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.rebel_contact}
                        width={props.width}
                        height={props.height}
                        style={props.style}
                    />
                </View>
            )
        }
        else if (walletAddress?.length) {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.wallet_contact}
                        width={props.width}
                        height={props.height}
                        style={props.style}
                    />
                </View>
            )
        } else if (email?.length) {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.email_contact}
                        width={props.width}
                        height={props.height}
                        style={props.style}
                    />
                </View>
            )
        } else {
            return (
                <View>
                    <SvgXml
                        xml={constants.SVGS.blank_user}
                        width={props.width}
                        height={props.height}
                        style={props.style}
                    />
                </View>
            )
        }
    }

    return (
        <View style={{ alignItems: 'center' }}>
            {renderUserImage()}
            {
                displayText &&
                <Text style={props.textStyle}>
                    {displayText}
                </Text>
            }
            {
                rebelfiContact !== null &&
                <Text style={props.subTextStyle}>
                    {JSON.parse(rebelfiContact)?.username}
                </Text>
            }
        </View>
    )
}

export default UserImage;
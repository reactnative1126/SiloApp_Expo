import * as React from 'react';
import {
    View,
    StyleSheet,
    Text,
    Button
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import constants from '../../constants';

export default function QRcodeScanner({ openCamera }: { openCamera: boolean }) {
    const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
    const [scanned, setScanned] = React.useState<boolean>(false);
    React.useEffect(() => {
        (async () => {
            if (openCamera) {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === 'granted');
            }
        })();
    }, []);
    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        setScanned(true);
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };

    if (hasPermission === null) {
        return <View style={styles.cameraLoadingTxt}>
            <Text style={{ color: constants.COLORS.TEXT_BRIGHTDARK }}>Requesting for camera permission</Text>
        </View>;
    } else if (hasPermission === false) {
        return <View style={styles.cameraLoadingTxt}>
            <Text style={styles.cameraLoadingTxt}>No access to camera</Text>
        </View>;
    }

    return (
        <View style={styles.scanContainer} >
            {openCamera && <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={[
                    StyleSheet.absoluteFillObject,
                    { height: 550 }
                ]}
            />}
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
}

const styles = StyleSheet.create({
    scanContainer: {
        flex: 1,
        padding: 0,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center'
    },
    cameraLoadingTxt: {
        color: constants.COLORS.TEXT_BRIGHTDARK,
        alignItems: 'center'
    }
});

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { navOptionHandler } from '@services/functions';

// import { Splash } from '@screens';
import Auth from './stacks/auth';
import Main from './tabs/main';

const StackApp = createStackNavigator();
export default AppContainer = () => {
    return (
        <NavigationContainer>
            <StackApp.Navigator initialRouteName='Auth' screenOptions={{ gestureEnabled: false }}>
                {/* <StackApp.Screen name='Splash' component={Splash} options={navOptionHandler} /> */}
                <StackApp.Screen name='Auth' component={Auth} options={navOptionHandler} />
                <StackApp.Screen name='Main' component={Main} options={navOptionHandler} />
            </StackApp.Navigator>
        </NavigationContainer>
    );
};
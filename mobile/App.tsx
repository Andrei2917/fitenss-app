import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider publishableKey="pk_test_51T5tKbJY6KtFkjuCLuaTUjjcFJl8J2dBA4aPiIbBJy0Wye1ECZLSppQtp7SVVqU0KlUh2BMldT3p7PBKsPUCQ9BP00AedXeIMu">
      <Provider store={store}>
        {/* ADD THIS NAVIGATION CONTAINER BACK IN! */}
        <NavigationContainer>
          <RootNavigator /> 
        </NavigationContainer>
      </Provider>
    </StripeProvider>
  );
}
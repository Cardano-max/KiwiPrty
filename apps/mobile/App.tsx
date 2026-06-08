import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/auth";
import { colors } from "./src/theme";
import { RootStackParamList } from "./src/navigation";
import HomeScreen from "./src/screens/HomeScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CartScreen from "./src/screens/CartScreen";
import AccountScreen from "./src/screens/AccountScreen";
import ProductScreen from "./src/screens/ProductScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import AssistantScreen from "./src/screens/AssistantScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabIcon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

const headerStyle = {
  headerStyle: { backgroundColor: colors.kiwi },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "800" as const },
};

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colors.kiwi, ...headerStyle }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Kiwi Party", tabBarIcon: tabIcon("🏠") }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: tabIcon("🔍") }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: tabIcon("🛒") }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarIcon: tabIcon("👤") }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={headerStyle}>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="Product" component={ProductScreen} options={{ title: "Product" }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login", presentation: "modal" }} />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: "My Orders" }} />
            <Stack.Screen name="Assistant" component={AssistantScreen} options={{ title: "AI Assistant" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

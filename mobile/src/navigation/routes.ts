// We use an "enum" here so that TypeScript auto-completes the screen names for us!
export enum AuthRoutes {
  LOGIN = 'Login',
  REGISTER = 'Register',
}

export enum AppRoutes {
  // We will add the main app screens (Tabs, Video Player, etc.) here later!
  MAIN_TABS = 'MainTabs',
}

// A combined type for the Root Navigator
export type RootStackParamList = {
  [AuthRoutes.LOGIN]: undefined;
  [AuthRoutes.REGISTER]: undefined;
  [AppRoutes.MAIN_TABS]: undefined;
};
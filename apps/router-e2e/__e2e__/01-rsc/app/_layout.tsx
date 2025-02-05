import '../global.css';
import 'server-only';

import { Link } from 'expo-router/build/rsc/exports';

import { unstable_styles } from '../home.module.css';
import { View } from '../lib/react-native';

const HomeLayout = (props) => {
  return (
    <View style={{ flex: 1, padding: 24 }} testID="layout-child-wrapper">
      {props.children}
      <View
        testID="layout-global-style"
        style={[
          { width: 100, height: 100 },
          { $$css: true, _: 'custom-global-style' },
        ]}
      />
      <View
        testID="layout-module-style"
        style={[{ width: 100, height: 100 }, unstable_styles.container]}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Link href="/" style={props.path === '/' ? { color: 'blue' } : {}}>
          One
        </Link>
        <Link href="/second" style={props.path === '/second' ? { color: 'blue' } : {}}>
          Two
        </Link>
      </View>
    </View>
  );
};

export default HomeLayout;

import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { TabBar, TabView } from 'react-native-tab-view';
import HingePlus from './HingePlus';
import HingeX from './HingeX';

const SubscriptionScreen = () => {
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    { key: 'hingeplus', title: 'Hinge+' },
    { key: 'hingeX', title: 'HingeX' },
  ]);
  const renderScene = ({
    route,
  }: {
    route: { key: string; title: string };
  }) => {
    switch (route.key) {
      case 'hingeplus':
        return <HingePlus />;
      case 'hingeX':
        return <HingeX />;
      default:
        return null;
    }
  };
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: '100%' }}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={{
                backgroundColor: index === 1 ? 'white' : '#9f4ec2',
              }}
              style={{
                backgroundColor: index === 1 ? '#181818' : '#F8F8F8',
              }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
              activeColor={index === 1 ? 'white' : '#9f4ec2'}
              inactiveColor={index === 1 ? '#C0C0C0' : '#202020'}
            />
          )}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({});
